import axios, { AxiosError, AxiosResponse } from 'axios';
import { CONSTANTS } from '../constants/constants';
import { ApiError } from '../error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export const api = axios.create({
    baseURL: `${API_URL}/api/${API_VERSION}`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

api.interceptors.request.use(
    (config) => config,
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        let message = 'Something went wrong';
        let status: number | undefined;
        let data: any;
        if (error.response) {
            status = error.response.status;
            data = error.response.data;
            message = (data as any)?.message || (data as any)?.error || error.message || 'Request failed';
            switch (error.response.status) {
                case 401:
                    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
            }
        } else if (error.request) {
            console.error('No response from server');
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(new ApiError(message, status, data));
    },
);
