import { PaginatedResponse, PaginationParams } from '@/interfaces/pagination.interface';
import { IProject } from '@/interfaces/project.interface';
import { get, post, patch, del } from '../axios/axios.helpers';

export interface ProjectListPayload extends PaginationParams {}

export interface CreateProjectPayload {
    title: string;
    description?: string;
    language?: string;
    git_link: string;
    git_username?: string;
    git_password?: string;
    git_branch?: string;
}

export interface UpdateProjectPayload {
    title?: string;
    description?: string;
    language?: string;
    git_link?: string;
}

export const projectsListApi = async (filters: ProjectListPayload): Promise<PaginatedResponse<IProject>> => {
    return get<PaginatedResponse<IProject>>(
        `/project?${new URLSearchParams(filters as Record<string, string>).toString()}`,
    );
};

export const createProjectApi = async (payload: CreateProjectPayload): Promise<IProject> => {
    return post<IProject>('/project', payload);
};

export const updateProjectApi = async (id: string, payload: UpdateProjectPayload): Promise<IProject> => {
    return patch<IProject>(`/project/${id}`, payload);
};

export const deleteProjectApi = async (id: string): Promise<IProject> => {
    return del<IProject>(`/project/${id}`);
};

export const getProjectApi = async (id: string): Promise<IProject> => {
    return get<IProject>(`/project/${id}`);
};

export const getProjectByUuidApi = async (id: string): Promise<{ uuid: string }> => {
    return get<{ uuid: string }>(`/project/by-uuid/${id}`);
};
