import { showErrorToast } from "./error-handler";

export async function safeAsync<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err: any) {
        showErrorToast(err.message || 'Something went wrong');
        return null;
    }
}