export type NotificationTemplateKey = 
    | 'PROJECT_CREATED' 
    | 'PROJECT_UPDATED' 
    | 'PROJECT_DELETED' 
    | 'MEMBER_ADDED' 
    | 'MEMBER_REMOVED' 
    | 'USER_CREATED' 
    | 'USER_UPDATED';

export interface INotificationTemplate {
    _id: string;
    key: NotificationTemplateKey;
    version: number;
    title: string;
    body: string;
    is_active: boolean;
    createdAt?: string;
    updatedAt?: string;
}
