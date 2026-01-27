import { toast } from 'sonner';

export function showErrorToast(error: any): void {
    let message = typeof error === 'string' ? error : 'An unknown error occurred';
    if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
    } else if (error.message) {
        message = error.message;
    }
    toast.error(message);
}

export class ApiError extends Error {
    status?: number;
    data?: any;

    constructor(message: string, status?: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}