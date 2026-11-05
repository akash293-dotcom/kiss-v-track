import { useState } from 'react';
import { Menu, Bell, LogOut, CheckCheck } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import api from '../../lib/api';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => Number((await api.get('/notifications/unread-count')).data?.data?.count || 0),
    refetchInterval: 60000,
  });
  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'topbar'],
    queryFn: async () => {
      const response = await api.get('/notifications', { params: { page: 1, limit: 6 } });
      return Array.isArray(response.data?.data?.notifications) ? response.data.data.notifications : [];
    },
    enabled: notificationsOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => api.patch('/notifications/read-all'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const portalTitle = user?.role === 'ADMIN' ? 'Admin Portal'
    : user?.role === 'CENTRE_ADMIN' ? 'Centre Admin Portal'
    : user?.role === 'TRAINER' ? 'Trainer Portal' : 'Trainee Portal';

  return (
    <div className="relative z-30 flex h-16 flex-shrink-0 bg-white shadow-sm">
      <button type="button" className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center justify-between px-4">
        <h1 className="hidden text-xl font-semibold text-gray-800 sm:block">{portalTitle}</h1>

        <div className="ml-auto flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }}
              aria-label={`Notifications${unreadQuery.data ? `, ${unreadQuery.data} unread` : ''}`}
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-5 w-5" />
              {!!unreadQuery.data && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unreadQuery.data > 9 ? '9+' : unreadQuery.data}</span>}
            </button>
            {notificationsOpen && (
              <>
                <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div><p className="font-semibold text-gray-900">Notifications</p><p className="text-xs text-gray-500">{unreadQuery.data || 0} unread</p></div>
                    <Button size="sm" variant="ghost" icon={<CheckCheck size={14} />} onClick={() => markAllReadMutation.mutate()} disabled={!unreadQuery.data || markAllReadMutation.isPending}>Mark all read</Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificationsQuery.isLoading ? <p className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications…</p>
                      : notificationsQuery.isError ? <p className="px-4 py-8 text-center text-sm text-red-600">Notifications could not be loaded.</p>
                      : !notificationsQuery.data?.length ? <p className="px-4 py-8 text-center text-sm text-gray-500">You are all caught up.</p>
                      : notificationsQuery.data.map((item: any) => (
                        <button key={item.id} type="button" onClick={() => { if (!item.isRead) markReadMutation.mutate(item.id); }} className={`block w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50 ${item.isRead ? 'bg-white' : 'bg-indigo-50/50'}`}>
                          <div className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? 'bg-gray-300' : 'bg-indigo-600'}`} /><span className="min-w-0"><span className="block text-sm font-semibold text-gray-900">{item.title}</span><span className="mt-0.5 block text-sm text-gray-600">{item.message}</span><span className="mt-1 block text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</span></span></div>
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button type="button" className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false); }} aria-label="Open user menu" aria-expanded={profileOpen}>
              <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" src={user?.profilePhoto} />
            </button>
            {profileOpen && (
              <>
                <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close user menu" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/5">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-600">{user?.role?.replace(/_/g, ' ')}</p>
                  </div>
                  <button type="button" onClick={() => { setProfileOpen(false); logout(); }} className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
