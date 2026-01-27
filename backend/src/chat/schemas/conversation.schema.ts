import { HydratedDocument, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export enum ConversationTypeEnum {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
}

export enum ConversationRoleEnum {
    USER = 'user',
    ASSISTANT = 'assistant',
}

export class IConversation {
    chat_id: Types.ObjectId;
    user_id: Types.ObjectId;
    content: string;
    type: string;
    role: string;
}

@Schema({ timestamps: true })
export class Conversation extends Document {
    @Prop({ type: MongoSchema.Types.ObjectId, required: [true, 'Chat ID is required'] })
    chat_id: Types.ObjectId;

    @Prop({ type: MongoSchema.Types.ObjectId, required: [true, 'User ID is required'] })
    user_id: Types.ObjectId;

    @Prop({ type: String, required: [true, 'Content is required'] })
    content: string;

    @Prop({ type: String, enum: ConversationTypeEnum, default: ConversationTypeEnum.TEXT })
    type: string;

    @Prop({ type: String, enum: ConversationRoleEnum, default: ConversationRoleEnum.USER })
    role: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
export type ConversationDocument = HydratedDocument<Conversation>;