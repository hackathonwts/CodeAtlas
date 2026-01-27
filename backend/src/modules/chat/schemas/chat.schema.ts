import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from 'src/modules/project/schemas/project.schema';
import { User } from 'src/modules/user/schemas/user.schema';

export interface IChat {
    _id?: Types.ObjectId;

    project_id: Types.ObjectId;
    title: string;
    user_id: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

@Schema({ timestamps: true, versionKey: false })
export class Chat {
    @Prop({ type: Types.ObjectId, ref: Project.name, required: [true, 'Project ID is required'] })
    project_id: Types.ObjectId;

    @Prop({ type: String, default: 'Untitled Chat' })
    title: string;

    @Prop({ type: Types.ObjectId, ref: User.name, required: [true, 'User ID is required'] })
    user_id: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
export type ChatDocument = HydratedDocument<Chat>;
