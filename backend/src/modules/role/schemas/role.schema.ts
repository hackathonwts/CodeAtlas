import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IPolicy } from 'src/modules/policy/policy.interface';
import { Policy } from 'src/modules/policy/schemas/policy.schema';

export enum UserRoleEnum {
    Admin = 'admin',
    User = 'user',
    Manager = 'manager',
}

export interface IRole {
    _id?: Types.ObjectId;

    role: UserRoleEnum;
    role_display_name: string;
    desc: string;
    policies: IPolicy[];
    is_deleted: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

@Schema({ timestamps: true, versionKey: false })
export class Role {
    @Prop({ type: String, enum: UserRoleEnum, default: UserRoleEnum.User, unique: true, index: true })
    role: UserRoleEnum;
    @Prop({ type: String, trim: true, default: '' })
    role_display_name: string;
    @Prop({ type: String, trim: true, default: '' })
    desc: string;

    @Prop([{ type: Types.ObjectId, ref: Policy.name }])
    policies: Types.ObjectId[];

    @Prop({ type: Boolean, default: false, index: true })
    is_deleted: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
export type RoleDocument = HydratedDocument<Role>;

RoleSchema.set('toJSON', {
    transform: (doc, ret: Partial<RoleDocument>) => {
        delete ret.__v;
        delete ret.is_deleted;
        return ret;
    },
});
