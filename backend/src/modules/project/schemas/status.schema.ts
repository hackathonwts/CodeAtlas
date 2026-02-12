import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StatusType = 'completed' | 'in_progress' | 'pending';

export interface IProjectStatus {
    title: string;
    description: string;
    status: StatusType;
    progress?: number;
    details?: string;
}

@Schema({ timestamps: true })
export class ProjectStatus extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: ['completed', 'in_progress', 'pending'], index: true })
    status: StatusType;

    @Prop({ default: 0, min: 0, max: 100 })
    progress?: number;

    @Prop()
    details?: string;
}

export const ProjectStatusSchema = SchemaFactory.createForClass(ProjectStatus);