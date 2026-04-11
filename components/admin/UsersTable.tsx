'use client';

import { User, Role, MembershipLevelLabels, MembershipLevel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, KeyRound, Trash2, Award } from 'lucide-react';
import { formatDate } from '@/lib/helpers';
import { UserActionState } from '@/hooks/useUserManagement';

type UsersTableProps = {
  users: User[];
  loading: boolean;
  currentUserId: string | undefined;
  editingUserId: string | null;
  onEditingUserChange: (userId: string | null) => void;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onUpdateMembership: (userId: string, level: MembershipLevel) => void;
  onUpdateRole: (userId: string, role: Role) => void;
  onToggleAccountant: (userId: string, isAccountant: boolean) => void;
  onDelete: (userId: string) => void;
  getActionState: (userId: string) => UserActionState;
};

const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Админ',
  [Role.USER]: 'Хэрэглэгч',
};

const getPrivilegeSummary = (user: User) => {
  const parts: string[] = [];
  if (user.role === Role.ADMIN) parts.push('Системийн удирдлага');
  if (user.isAccountant) parts.push('Санхүүгийн эрх');
  if (parts.length === 0) return 'Стандарт эрх';
  return parts.join(' • ');
};

export function UsersTable({
  users,
  loading,
  currentUserId,
  editingUserId,
  onEditingUserChange,
  onApprove,
  onReject,
  onUpdateMembership,
  onUpdateRole,
  onToggleAccountant,
  onDelete,
  getActionState,
}: UsersTableProps) {
  if (loading && users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-gray-500">Ачаалж байна...</p>
      </div>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-gray-500">Хэрэглэгч байхгүй.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Хэрэглэгч
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Имэйл
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Гишүүнчлэл
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
              Санхүү
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Эрх
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
              Төлөв
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
              Үйлдэл
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const actionState = getActionState(user.id);
            const isCurrentUser = user.id === currentUserId;

            return (
              <tr key={user.id} className="hover:bg-gray-50">
                {/* User name and ID */}
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-gray-900">{user.name || 'Нэргүй'}</p>
                  <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>

                {/* Membership Level */}
                <td className="px-4 py-3 align-top">
                  {editingUserId === user.id ? (
                    <select
                      value={user.membershipLevel}
                      onChange={(e) =>
                        onUpdateMembership(user.id, e.target.value as MembershipLevel)
                      }
                      disabled={actionState.loading}
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      {Object.entries(MembershipLevelLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      <Award className="h-3 w-3" />
                      {MembershipLevelLabels[user.membershipLevel] || user.membershipLevel}
                    </span>
                  )}
                </td>

                {/* Accountant Toggle */}
                <td className="px-4 py-3 text-center align-top">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={user.isAccountant}
                      onChange={(e) => onToggleAccountant(user.id, e.target.checked)}
                      disabled={actionState.loading}
                      className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                    />
                  </label>
                </td>

                {/* Role and Privileges */}
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        user.role === Role.ADMIN
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getPrivilegeSummary(user)}</p>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center align-top">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap justify-center gap-1">
                    {editingUserId === user.id ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditingUserChange(null)}
                      >
                        Болих
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditingUserChange(user.id)}
                          disabled={actionState.loading}
                          title="Гишүүнчлэл засах"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>

                        {/* Role Toggle */}
                        {user.role !== Role.ADMIN ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateRole(user.id, Role.ADMIN)}
                            disabled={actionState.loading}
                            title="Админ болгох"
                          >
                            <Award className="h-3.5 w-3.5" />
                          </Button>
                        ) : !isCurrentUser ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateRole(user.id, Role.USER)}
                            disabled={actionState.loading}
                            title="Админ болиулах"
                          >
                            <Award className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}

                        {/* Status Toggle */}
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReject(user.id)}
                            disabled={actionState.loading}
                            title="Идэвхгүй болгох"
                            className="text-red-600 hover:text-red-700"
                          >
                            Идэвхгүй
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onApprove(user.id)}
                            disabled={actionState.loading}
                            title="Идэвхтэй болгох"
                            className="text-green-600 hover:text-green-700"
                          >
                            Идэвхтэй
                          </Button>
                        )}

                        {/* Delete */}
                        {!isCurrentUser && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(user.id)}
                            disabled={actionState.loading}
                            title="Устгах"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Error/Success Messages */}
                  {actionState.error && (
                    <p className="text-xs text-red-600 mt-1">{actionState.error}</p>
                  )}
                  {actionState.success && (
                    <p className="text-xs text-green-600 mt-1">{actionState.success}</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
