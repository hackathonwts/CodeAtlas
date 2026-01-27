'use client';

import { Bell, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';
import moment from 'moment';
import { useAppSelector } from '@/app/store/hooks';
import { IUser } from '@/interfaces/user.interface';
import { showErrorToast } from '@/app/utils/error-handler';
import { deleteNotificationApi, getAllNotificationsApi, markNotificationAsReadApi } from '@/app/utils/apis/notification-api';
import { safeAsync } from '@/app/utils/safeAsync';

export interface INotification {
    _id: string;
    title: string;
    body: string;
    timestamp: Date;
    read: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export function NotificationButton() {
    const user = useAppSelector((s) => s.auth.user) as IUser;
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = async (id: string) => {
        await safeAsync(() => markNotificationAsReadApi(id)) && setNotifications((prev) => prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif)))
    }

    const deleteNotification = async (id: string) => {
        await safeAsync(() => deleteNotificationApi(id)) && setNotifications((prev) => prev.filter((notif) => notif._id !== id))
    }

    const clearAll = () => setNotifications([]);
    const fetchNotifications = async () => {
        const result = await safeAsync(() => getAllNotificationsApi());
        setNotifications(result || []);
    }

    useEffect(() => {
        if (!user?._id) return;
        const source = new EventSource(`${API_URL}/api/${API_VERSION}/notification/stream?clientId=${user._id}`);
        source.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setNotifications((prev) => [...prev, msg]);
        };

        fetchNotifications();
        return () => source.close();
    }, [user]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                            variant="outline"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-100 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="font-semibold">Notifications</h2>
                    {notifications.length > 0 && (
                        <Button disabled variant="destructive" size="sm" onClick={clearAll} className="text-xs">
                            Clear all
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <ScrollArea className="h-100">
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`flex gap-3 border-b p-4 transition-colors hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-muted/30' : ''
                                        }`}
                                    onClick={() => markAsRead(notification._id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">{notification.title}</p>
                                            {!notification.read && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {notification.body}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {moment(notification.timestamp).fromNow()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
