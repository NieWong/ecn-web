'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { notificationsAPI } from '@/lib/api';
import { Notification, NotificationType } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Дөнгөж сая';
  if (diffMins < 60) return `${diffMins} минутын өмнө`;
  if (diffHours < 24) return `${diffHours} цагийн өмнө`;
  if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
  return date.toLocaleDateString('mn-MN');
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.ARTICLE_APPROVED:
      return '✅';
    case NotificationType.ARTICLE_REJECTED:
      return '❌';
    case NotificationType.ARTICLE_SUBMITTED:
      return '📝';
    case NotificationType.ARTICLE_COMMENTED:
      return '💬';
    case NotificationType.MEMBERSHIP_CHANGED:
      return '🎖️';
    case NotificationType.USER_APPROVED:
      return '🎉';
    case NotificationType.SYSTEM:
    default:
      return '🔔';
  }
};

const getNotificationSystemKind = (notification: Notification) => {
  const metadata = notification.metadata as Record<string, unknown> | null;
  const kind = metadata?.kind;
  return typeof kind === 'string' ? kind : null;
};

const getNotificationAction = (notification: Notification, role: string | undefined) => {
  const kind = getNotificationSystemKind(notification);

  if (kind === 'PASSWORD_RESET_REQUEST' && role === 'ADMIN') {
    return { href: '/admin', label: 'Админ самбар руу' };
  }

  if (kind === 'PASSWORD_RESET_APPROVED') {
    const metadata = notification.metadata as Record<string, unknown> | null;
    const email = typeof metadata?.email === 'string' ? metadata.email : null;
    return {
      href: email ? `/set-password?email=${encodeURIComponent(email)}` : '/set-password',
      label: 'Нууц үг тохируулах',
    };
  }

  if (notification.postId) {
    return { href: `/article/${notification.postId}`, label: 'Нийтлэл харах →' };
  }

  return null;
};

const getNotificationTypeLabel = (notification: Notification) => {
  const kind = getNotificationSystemKind(notification);

  if (kind === 'PASSWORD_RESET_REQUEST') return 'Нууц үг reset хүсэлт';
  if (kind === 'PASSWORD_RESET_APPROVED') return 'Нууц үг reset зөвшөөрөгдсөн';

  const type = notification.type;
  switch (type) {
    case NotificationType.ARTICLE_APPROVED:
      return 'Нийтлэл баталгаажсан';
    case NotificationType.ARTICLE_REJECTED:
      return 'Нийтлэл татгалзсан';
    case NotificationType.ARTICLE_SUBMITTED:
      return 'Нийтлэл илгээсэн';
    case NotificationType.ARTICLE_COMMENTED:
      return 'Сэтгэгдэл';
    case NotificationType.MEMBERSHIP_CHANGED:
      return 'Гишүүнчлэл';
    case NotificationType.USER_APPROVED:
      return 'Бүртгэл баталгаажсан';
    case NotificationType.SYSTEM:
    default:
      return 'Систем';
  }
};

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notifs = await notificationsAPI.list({
        unreadOnly: filter === 'unread',
        take: 100,
      });
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (user) {
      void fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Бүх мэдэгдлийг устгах уу?')) return;
    try {
      await notificationsAPI.deleteAll();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-gray-600">Ачаалж байна...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Мэдэгдэл</h1>
            <p className="mt-3 text-gray-600">Мэдэгдэл харахын тулд нэвтэрнэ үү.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button>Нэвтрэх</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Мэдэгдэл
            </h1>
            <p className="mt-2 text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} уншаагүй мэдэгдэл байна`
                : 'Бүх мэдэгдэл уншсан'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Бүгд</option>
              <option value="unread">Уншаагүй</option>
            </select>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Бүгдийг уншсан
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="destructive" onClick={handleDeleteAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Бүгдийг устгах
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Ачаалж байна...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Мэдэгдэл байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative rounded-xl border bg-white p-6 shadow-sm transition-all ${
                    !notification.isRead
                      ? 'border-blue-200 bg-blue-50/50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-4">
                    <span className="text-3xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 mb-2">
                            {getNotificationTypeLabel(notification)}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-600">{notification.message}</p>
                      {(() => {
                        const action = getNotificationAction(notification, user?.role);
                        if (!action) return null;
                        return (
                          <Link
                            href={action.href}
                            className="mt-2 inline-flex text-sm text-blue-600 hover:underline"
                          >
                            {action.label}
                          </Link>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Уншсан гэж тэмдэглэх"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Устгах"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
