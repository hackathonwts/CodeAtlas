import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../user/schemas/user.schema";
import { Model, QueryFilter } from "mongoose";
import { IPolicy } from "../policy/policy.interface";


export interface IAuthUser extends Omit<UserDocument, 'active_role' | 'roles' | 'policies'> {
    policies?: {
        allow: IPolicy[];
        deny: IPolicy[];
    };
    active_role?: {
        _id: string;
        role: string;
        role_display_name: string;
        policies: IPolicy[];
        desc: string;
    };
    roles?: {
        _id: string;
        role: string;
        role_display_name: string;
        policies: IPolicy[];
        desc: string;
    }[];
}

export class AuthRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    async getAuthUser(filter: QueryFilter<UserDocument>): Promise<IAuthUser | null> {
        return this.userModel
            .findOne({ ...filter, is_deleted: false })
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name policies desc',
                populate: {
                    path: 'policies',
                    select: 'action subject fields conditions inverted reason'
                }
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name policies desc',
                populate: {
                    path: 'policies',
                    select: 'action subject fields conditions inverted reason'
                }
            })
            .populate({
                path: 'policies.allow',
                select: 'action subject fields conditions inverted reason'
            })
            .populate({
                path: 'policies.deny',
                select: 'action subject fields conditions inverted reason'
            }) as Promise<IAuthUser | null>;
    }
}