
export interface IPolicy {
    action: string;
    subject: string;
    conditions?: any;
    inverted: boolean;
}
