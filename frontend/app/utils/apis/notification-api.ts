import { del, get, put } from '../axios/axios.helpers';
import { INotification } from '@/components/notifications';

export const getAllNotificationsApi = () => get<INotification[]>('/notification');
export const markNotificationAsReadApi = (id: string) => put<{ message: string }>(`/notification/${id}/read`);
export const deleteNotificationApi = (id: string) => del<{ message: string }>(`/notification/${id}/delete`);