import { IUser } from '@/interfaces/user.interface';
import { IPolicy } from '@/interfaces/policy.interface';
import { get, post, put, patch, del } from '../axios/axios.helpers';

export interface GetUsersResponse {
    data: IUser[];
    page: number;
    limit: number;
    total_pages: number;
    total_count: number;
    message: string;
}

export interface GetUsersFilter {
    page?: number;
    limit?: number;
    search?: string;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateUserPayload {
    full_name: string;
    email: string;
    password: string;
    policies?: {
        allow: string[];
        deny: string[];
    };
}

export interface UpdateUserPayload {
    full_name?: string;
    email?: string;
    status?: string;
    policies?: {
        allow: string[];
        deny: string[];
    };
}

export const getAllUsersApi = async (filters: GetUsersFilter): Promise<GetUsersResponse> => {
    return get<GetUsersResponse>(`/user?${new URLSearchParams(filters as Record<string, string>).toString()}`);
};

export const createUserApi = async (payload: CreateUserPayload): Promise<IUser> => {
    return post<IUser>('/user', payload);
};

export const updateUserApi = async (id: string, payload: UpdateUserPayload): Promise<IUser> => {
    return patch<IUser>(`/user/${id}`, payload);
};

export const deleteUserApi = async (id: string): Promise<IUser> => {
    return del<IUser>(`/user/${id}`);
};

export const getUserApi = async (id: string): Promise<IUser> => {
    return get<IUser>(`/user/${id}`);
};
