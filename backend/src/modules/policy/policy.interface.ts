
export interface IPolicy {
    action: string;
    subject: string;
    fields?: string[];
    conditions?: any;
    inverted?: boolean;
    reason?: string;
}
