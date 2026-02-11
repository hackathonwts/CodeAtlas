import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';
import type { IPolicy } from '../policy.interface';

@Schema({ timestamps: true, versionKey: false })
export class Policy implements IPolicy {
    @Prop({ required: true })
    action: string;

    @Prop({ default: '', required: true })
    subject: string;

    @Prop({ type: MongoSchema.Types.Mixed, default: null })
    conditions?: any;

    @Prop({ default: false })
    inverted: boolean;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
export type PolicyDocument = HydratedDocument<Policy>;

PolicySchema.index(
    { action: 1, subject: 1 },
    {
        partialFilterExpression: {
            action: { $exists: true, $ne: '' },
            subject: { $exists: true, $ne: '' },
        },
    },
);
PolicySchema.plugin(require('mongoose-aggregate-paginate-v2'));
PolicySchema.set('toJSON', {
    transform: (doc, ret: Partial<PolicyDocument>) => {
        delete ret.__v;
        return ret;
    },
});
