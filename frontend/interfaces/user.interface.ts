import { IRole } from "./role.interface"
import { IPolicy } from "./policy.interface"

export interface IUser {
    _id: string
    full_name: string
    email: string
    phone: string
    profile_image: string
    createdAt?: string
    active_role: IRole
    roles: IRole[]
    policy?: IPolicy[]
    status?: string
}
