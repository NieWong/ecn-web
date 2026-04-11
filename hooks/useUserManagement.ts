import { useState, useCallback } from 'react';
import {
  User,
  Role,
  MembershipLevel,
  Notification,
  NotificationType,
} from '@/lib/types';
import { usersAPI, notificationsAPI } from '@/lib/api';

export type PasswordResetRequest = {
  notificationId: string;
  requestedByUserId: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export type UserActionState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export const useUserManagement = (onDataChange?: () => void) => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);
  const [actionState, setActionState] = useState<Record<string, UserActionState>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to get action state for a user
  const getActionState = useCallback(
    (userId: string): UserActionState =>
      actionState[userId] || { loading: false, error: null, success: null },
    [actionState]
  );

  // Helper to set action state
  const setUserActionState = useCallback((userId: string, state: Partial<UserActionState>) => {
    setActionState((prev) => ({
      ...prev,
      [userId]: { ...getActionState(userId), ...state },
    }));
  }, [getActionState]);

  // Extract password reset requests from notifications
  const extractPasswordResetRequests = useCallback((notifications: Notification[]): PasswordResetRequest[] => {
    const requests = notifications
      .filter((notification) => {
        if (notification.type !== NotificationType.SYSTEM) return false;
        const metadata = notification.metadata as Record<string, unknown> | null;
        return metadata?.kind === 'PASSWORD_RESET_REQUEST';
      })
      .map((notification) => {
        const metadata = (notification.metadata as Record<string, unknown> | null) ?? {};
        return {
          notificationId: notification.id,
          requestedByUserId: String(metadata.requestedByUserId || ''),
          email: String(metadata.email || ''),
          name: metadata.name ? String(metadata.name) : null,
          createdAt: notification.createdAt,
        };
      })
      .filter((request) => request.requestedByUserId && request.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const deduped = new Map<string, PasswordResetRequest>();
    requests.forEach((request) => {
      if (!deduped.has(request.requestedByUserId)) {
        deduped.set(request.requestedByUserId, request);
      }
    });

    return Array.from(deduped.values());
  }, []);

  // Filter users by search query
  const filteredAllUsers = useCallback(() => {
    if (!searchQuery.trim()) return allUsers;
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query)
    );
  }, [allUsers, searchQuery]);

  // Approve user (optimistic update)
  const approveUser = useCallback(
    async (id: string) => {
      const originalUsers = pendingUsers;
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
      setUserActionState(id, { loading: true, error: null });

      try {
        await usersAPI.approve(id);
        setUserActionState(id, { loading: false, success: 'Бүртгэл зөвшөөргөлөө' });
        setTimeout(() => setUserActionState(id, { loading: false }), 2000);
        onDataChange?.();
      } catch (err) {
        setPendingUsers(originalUsers);
        const message = err instanceof Error ? err.message : 'Бүртгэл зөвшөөрөхөд алдаа гарлаа';
        setUserActionState(id, { loading: false, error: message });
      }
    },
    [pendingUsers, onDataChange, setUserActionState]
  );

  // Reject user (optimistic update)
  const rejectUser = useCallback(
    async (id: string) => {
      const originalUsers = pendingUsers;
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
      setUserActionState(id, { loading: true, error: null });

      try {
        await usersAPI.deactivate(id);
        setUserActionState(id, { loading: false, success: 'Бүртгэл татгалзалаа' });
        setTimeout(() => setUserActionState(id, { loading: false }), 2000);
        onDataChange?.();
      } catch (err) {
        setPendingUsers(originalUsers);
        const message = err instanceof Error ? err.message : 'Бүртгэл татгалзахад алдаа гарлаа';
        setUserActionState(id, { loading: false, error: message });
      }
    },
    [pendingUsers, onDataChange, setUserActionState]
  );

  // Update user membership level (optimistic update)
  const updateMembership = useCallback(
    async (userId: string, level: MembershipLevel) => {
      const originalUsers = allUsers;
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, membershipLevel: level } : u))
      );
      setEditingUserId(null);
      setUserActionState(userId, { loading: true, error: null });

      try {
        await usersAPI.updateMembershipLevel(userId, level);
        setUserActionState(userId, { loading: false, success: 'Гишүүнчлэл сарнив' });
        setTimeout(() => setUserActionState(userId, { loading: false }), 2000);
      } catch (err) {
        setAllUsers(originalUsers);
        const message = err instanceof Error ? err.message : 'Гишүүнчлэл өөрчлөхөд алдаа гарлаа';
        setUserActionState(userId, { loading: false, error: message });
      }
    },
    [allUsers, setUserActionState]
  );

  // Update user role (optimistic update)
  const updateRole = useCallback(
    async (userId: string, role: Role) => {
      const originalUsers = allUsers;
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      setUserActionState(userId, { loading: true, error: null });

      try {
        await usersAPI.updateRole(userId, role);
        setUserActionState(userId, { loading: false, success: 'Үүрэг өөрчлөгдлөө' });
        setTimeout(() => setUserActionState(userId, { loading: false }), 2000);
      } catch (err) {
        setAllUsers(originalUsers);
        const message = err instanceof Error ? err.message : 'Үүрэг өөрчлөхөд алдаа гарлаа';
        setUserActionState(userId, { loading: false, error: message });
      }
    },
    [allUsers, setUserActionState]
  );

  // Toggle accountant access (optimistic update)
  const toggleAccountant = useCallback(
    async (userId: string, isAccountant: boolean) => {
      const originalUsers = allUsers;
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAccountant } : u))
      );
      setUserActionState(userId, { loading: true, error: null });

      try {
        await usersAPI.updateAccountantAccess(userId, isAccountant);
        setUserActionState(userId, { loading: false });
      } catch (err) {
        setAllUsers(originalUsers);
        const message = err instanceof Error ? err.message : 'Санхүүгийн эрх өөрчлөхөд алдаа гарлаа';
        setUserActionState(userId, { loading: false, error: message });
      }
    },
    [allUsers, setUserActionState]
  );

  // Allow password reset (optimistic update)
  const allowPasswordReset = useCallback(
    async (request: PasswordResetRequest) => {
      const originalRequests = passwordResetRequests;
      setPasswordResetRequests((prev) =>
        prev.filter((r) => r.requestedByUserId !== request.requestedByUserId)
      );
      setUserActionState(request.requestedByUserId, { loading: true, error: null });

      try {
        await usersAPI.allowPasswordReset(request.requestedByUserId);
        if (request.notificationId) {
          await notificationsAPI.markAsRead(request.notificationId);
        }
        setUserActionState(request.requestedByUserId, { loading: false, success: 'Нууц үг сэргээх зөвшөөргөлөө' });
        setTimeout(() => setUserActionState(request.requestedByUserId, { loading: false }), 2000);
        onDataChange?.();
      } catch (err) {
        setPasswordResetRequests(originalRequests);
        const message = err instanceof Error ? err.message : 'Нууц үг сэргээхэд алдаа гарлаа';
        setUserActionState(request.requestedByUserId, { loading: false, error: message });
      }
    },
    [passwordResetRequests, onDataChange, setUserActionState]
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId: string) => {
      if (!confirm('Та энэ хэрэглэгчийг бүр мөсөн устгахдаа итгэлтэй байна уу?')) return;
      
      const originalUsers = allUsers;
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
      setUserActionState(userId, { loading: true, error: null });

      try {
        await usersAPI.deleteUser(userId);
        setUserActionState(userId, { loading: false, success: 'Хэрэглэгч устгалаа' });
        setTimeout(() => setUserActionState(userId, { loading: false }), 2000);
        onDataChange?.();
      } catch (err) {
        setAllUsers(originalUsers);
        const message = err instanceof Error ? err.message : 'Хэрэглэгч устгахад алдаа гарлаа';
        setUserActionState(userId, { loading: false, error: message });
      }
    },
    [allUsers, onDataChange, setUserActionState]
  );

  // Update all user data
  const updateUsersData = useCallback(
    (
      pending: User[],
      all: User[],
      notifications: Notification[]
    ) => {
      setPendingUsers(pending);
      setAllUsers(all);
      setPasswordResetRequests(extractPasswordResetRequests(notifications));
      setEditingUserId(null);
      setActionState({});
    },
    [extractPasswordResetRequests]
  );

  return {
    pendingUsers,
    allUsers,
    filteredAllUsers: filteredAllUsers(),
    passwordResetRequests,
    searchQuery,
    setSearchQuery,
    editingUserId,
    setEditingUserId,
    getActionState,
    // Actions
    approveUser,
    rejectUser,
    updateMembership,
    updateRole,
    toggleAccountant,
    allowPasswordReset,
    deleteUser,
    updateUsersData,
  };
};
