import { InjectModel } from "@nestjs/mongoose";
import { IUser, User, UserDocument, UserStatus } from "../user/schemas/user.schema";
import { Model, QueryFilter } from "mongoose";
import { IPolicy } from "../policy/policy.interface";


export interface IAuthUser extends Omit<UserDocument, 'active_role' | 'roles' | 'policies'> {
    policies?: IPolicy[] | string;
    active_role?: {
        _id: string;
        role: string;
        role_display_name: string;
        policy: IPolicy[];
        desc: string;
    };
    roles?: {
        _id: string;
        role: string;
        role_display_name: string;
        policy: IPolicy[];
        desc: string;
    }[];
}

export class UserRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    async getAuthUser(filter: QueryFilter<UserDocument>): Promise<IAuthUser | null> {
        return this.userModel
            .findOne({ ...filter, is_deleted: false })
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name policy desc',
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name policy desc',
            }) as Promise<IAuthUser | null>;
    }
}