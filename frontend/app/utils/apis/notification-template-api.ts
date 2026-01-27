import { INotificationTemplate, NotificationTemplateKey } from '@/interfaces/notification-template.interface';
import { get, post, del } from '../axios/axios.helpers';

export interface CreateTemplatePayload {
    key: NotificationTemplateKey;
    version?: number;
    title: string;
    body: string;
    is_active?: boolean;
}

export interface UpdateTemplatePayload {
    version?: number;
    title?: string;
    body?: string;
    is_active?: boolean;
}

export const getAllTemplatesApi = async (): Promise<INotificationTemplate[]> => {
    return get<INotificationTemplate[]>('/notification/templates');
};

export const getTemplateByKeyApi = async (key: NotificationTemplateKey): Promise<INotificationTemplate> => {
    return get<INotificationTemplate>(`/notification/templates/${key}`);
};

export const createOrUpdateTemplateApi = async (payload: CreateTemplatePayload): Promise<INotificationTemplate> => {
    return post<INotificationTemplate>('/notification/templates', payload);
};

export const deleteTemplateApi = async (key: NotificationTemplateKey): Promise<{ message: string }> => {
    return del<{ message: string }>(`/notification/templates/${key}`);
};

export const seedTemplatesApi = async (): Promise<{ message: string; count: number }> => {
    return post<{ message: string; count: number }>('/notification/templates/seed', {});
};
