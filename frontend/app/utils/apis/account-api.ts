import { IUser } from "@/interfaces/user.interface";
import { post, put } from "../axios/axios.helpers";

export interface UpdatePersonalInfoRequest {
    full_name?: string;
    password?: string;
    old_password?: string;
}
export interface VerifyEmailRequest {
    new_email: string;
}

export interface ChangeEmailRequest {
    new_email: string;
    otp: number;
}

export const updatePersonalInfoApi = async (data: UpdatePersonalInfoRequest): Promise<IUser> => {
    return put<IUser>('/user/personal-info', data);
};

export const verifyEmailApi = async (new_email: string): Promise<IUser> => {
    return post<IUser>('/user/verify-email', { new_email });
}

export const changeEmailApi = async (new_email: string, otp: number): Promise<IUser> => {
    return post<IUser>('/user/change-email', { new_email, otp });
}