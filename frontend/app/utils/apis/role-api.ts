import { IRole } from '@/interfaces/role.interface';
import { IPolicy } from '@/interfaces/policy.interface';
import { get, post, put, patch, del } from '../axios/axios.helpers';

export interface GetRolesResponse {
    data: IRole[];
    message: string;
}

export interface CreateRolePayload {
    role: string;
    role_display_name: string;
    desc?: string;
    policies?: string[];
}

export interface UpdateRolePayload {
    role?: string;
    role_display_name?: string;
    desc?: string;
    policies?: string[];
}

export const getAllRolesApi = async (): Promise<IRole[]> => {
    const response = await get<IRole[]>('/role');
    return response;
};

export const createRoleApi = async (payload: CreateRolePayload): Promise<IRole> => {
    return post<IRole>('/role', payload);
};

export const updateRoleApi = async (id: string, payload: UpdateRolePayload): Promise<IRole> => {
    return patch<IRole>(`/role/${id}`, payload);
};

export const deleteRoleApi = async (id: string): Promise<IRole> => {
    return del<IRole>(`/role/${id}`);
};

export const getRoleApi = async (id: string): Promise<IRole> => {
    return get<IRole>(`/role/${id}`);
};
