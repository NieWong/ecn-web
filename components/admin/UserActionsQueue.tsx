'use client';

import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, KeyRound } from 'lucide-react';
import { formatDate } from '@/lib/helpers';
import Link from 'next/link';
import { PasswordResetRequest, UserActionState } from '@/hooks/useUserManagement';

type UserActionsQueueProps = {
  pendingUsers: User[];
  passwordResetRequests: PasswordResetRequest[];
  onApprovePending: (userId: string) => void;
  onRejectPending: (userId: string) => void;
  onAllowPasswordReset: (request: PasswordResetRequest) => void;
  getActionState: (userId: string) => UserActionState;
};

export function UserActionsQueue({
  pendingUsers,
  passwordResetRequests,
  onApprovePending,
  onRejectPending,
  onAllowPasswordReset,
  getActionState,
}: UserActionsQueueProps) {
  const hasRequests = pendingUsers.length > 0 || passwordResetRequests.length > 0;

  if (!hasRequests) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <p className="text-sm text-green-700">✓ Нэмэлт үйлдэл шаардлагагүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending User Registrations */}
      {pendingUsers.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            Хүлээгдэж буй бүртгэл ({pendingUsers.length})
          </h4>
          <div className="space-y-2 rounded-xl border border-orange-200 bg-orange-50 p-4">
            {pendingUsers.map((user) => {
              const actionState = getActionState(user.id);
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 border-b border-orange-100 pb-3 last:border-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{user.name || 'Нэргүй'}</p>
                    <p className="truncate text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => onApprovePending(user.id)}
                      disabled={actionState.loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Зөвшөөрөх
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRejectPending(user.id)}
                      disabled={actionState.loading}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Татгалзах
                    </Button>
                  </div>
                  {actionState.error && (
                    <p className="col-span-full text-xs text-red-600">{actionState.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Password Reset Requests */}
      {passwordResetRequests.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            Нууц үг сэргээх хүсэлт ({passwordResetRequests.length})
          </h4>
          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
            {passwordResetRequests.map((request) => {
              const actionState = getActionState(request.requestedByUserId);
              return (
                <div
                  key={request.notificationId}
                  className="flex flex-col gap-3 border-b border-amber-100 pb-3 last:border-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{request.name || request.email}</p>
                    <p className="truncate text-sm text-gray-600">{request.email}</p>
                    <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/set-password?email=${encodeURIComponent(request.email)}`}
                      className="inline-flex items-center rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
                    >
                      Холбоос
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => onAllowPasswordReset(request)}
                      disabled={actionState.loading}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Зөвшөөрөх
                    </Button>
                  </div>
                  {actionState.error && (
                    <p className="col-span-full text-xs text-red-600">{actionState.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
