import { IPolicy } from "./policy.interface"

export interface IRole {
    _id?: string
    role: string
    role_display_name: string
    desc: string
    policies?: IPolicy[]
    createdAt?: string
    updatedAt?: string
}