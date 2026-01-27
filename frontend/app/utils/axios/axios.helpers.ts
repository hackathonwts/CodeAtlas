import { api } from './axios';
import { AxiosRequestConfig } from 'axios';

/**
 * Generic API Helper Functions
 */

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

/**
 * GET request helper
 */
export const get = async <T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<T>(endpoint, config);
    return response.data;
};

/**
 * POST request helper
 */
export const post = async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<T>(endpoint, data, config);
    return response.data;
};

/**
 * PUT request helper
 */
export const put = async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<T>(endpoint, data, config);
    return response.data;
};

/**
 * PATCH request helper
 */
export const patch = async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<T>(endpoint, data, config);
    return response.data;
};

/**
 * DELETE request helper
 */
export const del = async <T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<T>(endpoint, config);
    return response.data;
};

/**
 * Upload file helper (multipart/form-data)
 */
export const uploadFile = async <T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }

    const response = await api.post<T>(endpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload multiple files helper
 */
export const uploadFiles = async <T = any>(
    endpoint: string,
    files: File[],
    additionalData?: Record<string, any>,
): Promise<T> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }

    const response = await api.post<T>(endpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Download file helper
 */
export const downloadFile = async (endpoint: string, filename?: string): Promise<void> => {
    const response = await api.get(endpoint, {
        responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `download-${Date.now()}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: any): ApiError => {
    if (error.response) {
        return {
            message: error.response.data?.message || 'An error occurred',
            status: error.response.status,
            errors: error.response.data?.errors,
        };
    } else if (error.request) {
        return {
            message: 'No response from server. Please check your connection.',
        };
    } else {
        return {
            message: error.message || 'An unexpected error occurred',
        };
    }
};

/**
 * Check if running in browser
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Get API base URL
 */
export const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1740';
};

/**
 * Get full API URL with version
 */
export const getApiUrl = (): string => {
    const baseUrl = getApiBaseUrl();
    const version = process.env.NEXT_PUBLIC_API_VERSION || 'v2';
    return `${baseUrl}/api/${version}`;
};
