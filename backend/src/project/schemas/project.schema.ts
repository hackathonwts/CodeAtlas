import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export enum ProjectStatusEnum {
    Active = 'Active',
    Inactive = 'Inactive',
    Archived = 'Archived',
}
export interface IProject {
    _id?: Types.ObjectId;

    created_by?: Types.ObjectId;
    members?: Types.ObjectId[];
    title?: string;
    description?: string;
    language?: string;
    git_link?: string;
    is_deleted?: boolean;
    status?: ProjectStatusEnum;

    createdAt?: Date;
    updatedAt?: Date;
}

@Schema({ timestamps: true, versionKey: false })
export class Project {
    @Prop({ type: Types.ObjectId, required: [true, 'Created by user is required'], ref: User.name })
    created_by: Types.ObjectId;

    @Prop({ type: String, default: '' })
    title: string;

    @Prop({ type: String, default: '' })
    description: string;

    @Prop({ type: String, default: '' })
    language: string;

    @Prop({ required: true, unique: [true, 'Project with this git link already exists'] })
    git_link: string;

    @Prop({ type: Boolean, default: false, index: true })
    is_deleted: boolean;
    @Prop({ type: String, default: ProjectStatusEnum.Inactive, enum: ProjectStatusEnum })
    status: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = HydratedDocument<Project>;

ProjectSchema.index({ 'members.user_id': 1 });
ProjectSchema.plugin(require('mongoose-aggregate-paginate-v2'));
ProjectSchema.set('toJSON', {
    transform: (doc, ret: Partial<ProjectDocument>) => {
        delete ret.is_deleted;
        return ret;
    },
});
