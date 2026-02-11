
export interface IPolicy {
    action: string;
    subject: string;
    fields?: string[];
    conditions?: any;
    inverted?: boolean;
    reason?: string;
}

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
    View = 'view',
}