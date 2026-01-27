import { IUser } from '@/interfaces/user.interface';
import { post, get } from '../axios/axios.helpers';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    data: {
        token: string;
        user: IUser;
    };
    message: string;
    status: number;
    type: 'success' | 'error';
}

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
    return post<LoginResponse>('/auth/login', { email, password });
};

export const logoutApi = async (): Promise<void> => {
    return post<void>('/auth/logout');
};

export const switchUserRoleApi = async (roleId: string)=> post<IUser>('/user/switch-role', { roleId });

export const meApi = async (): Promise<{ data: IUser }> => {
    return get<{ data: IUser }>('/user/me');
};