import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Subject } from "rxjs";
import { INotification, Notification, NotificationDocument } from "./schemas/notification.schema";
import { Model } from "mongoose";
import { INotificationTemplate, NotificationTemplate, NotificationTemplateDocument, NotificationTemplateKey } from "./schemas/notification-template.schema";


@Injectable()
export class NotificationService {
    private clientStreams = new Map<string, Subject<MessageEvent>>();
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(NotificationTemplate.name) private notificationTemplateModel: Model<NotificationTemplateDocument>,
    ) { }

    registerClient(clientId: string, subject: Subject<MessageEvent>) {
        this.clientStreams.set(clientId, subject);
    }

    unregisterClient(clientId: string) {
        this.clientStreams.delete(clientId);
    }

    async sendToClient(userId: string, data: Omit<INotification, '_id' | 'user_id' | 'createdAt' | 'updatedAt' | 'timestamp' | 'read'>) {
        try {
            const subject = this.clientStreams.get(userId);
            const notification = await this.notificationModel.create({ ...data, user_id: userId })
            subject?.next({ data: notification } as any);
        } catch (error) {
            console.error(error);
        }
    }

    async sendWithTemplate(userId: string, templateKey: NotificationTemplateKey, variables: Record<string, any>) {
        try {
            const template = await this.notificationTemplateModel.findOne({ key: templateKey, is_active: true });
            if (!template) throw new NotFoundException(`Template with key "${templateKey}" not found or inactive`);

            const renderedTitle = this.renderTemplate(template.title, variables);
            const renderedBody = this.renderTemplate(template.body, variables);

            return this.sendToClient(userId, {
                title: renderedTitle,
                body: renderedBody,
                template: templateKey,
            });
        } catch (error) {
            console.error(error);
        }
    }

    private renderTemplate(template: string, variables: Record<string, any>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] !== undefined ? String(variables[key]) : match;
        });
    }

    async getAllNotifications() {
        return this.notificationModel.find()
            .populate('user_id', 'full_name email')
            .sort({ createdAt: -1 });
    }

    async markAsRead(id: string) {
        return this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true });
    }

    async deleteNotification(id: string) {
        return this.notificationModel.findByIdAndDelete(id);
    }

    // Template Management Methods

    async upsertTemplate(data: Partial<Omit<INotificationTemplate, '_id' | 'createdAt' | 'updatedAt'>> & { key: NotificationTemplateKey }) {
        const templateData = {
            ...data,
            version: data.version ?? 1,
            is_active: data.is_active ?? true,
            updatedAt: new Date()
        };

        return this.notificationTemplateModel.findOneAndUpdate(
            { key: data.key },
            templateData,
            { new: true, upsert: true }
        );
    }

    async getTemplates() {
        return this.notificationTemplateModel.find().sort({ createdAt: -1 });
    }

    async getTemplateByKey(key: NotificationTemplateKey) {
        const template = await this.notificationTemplateModel.findOne({ key });
        if (!template) {
            throw new NotFoundException(`Template with key "${key}" not found`);
        }
        return template;
    }

    async deleteTemplate(key: NotificationTemplateKey) {
        const result = await this.notificationTemplateModel.findOneAndDelete({ key });
        if (!result) {
            throw new NotFoundException(`Template with key "${key}" not found`);
        }
        return { message: 'Template deleted successfully' };
    }

    async seedTemplates() {
        const defaultTemplates: Omit<INotificationTemplate, '_id' | 'createdAt' | 'updatedAt'>[] = [
            {
                key: 'PROJECT_CREATED',
                version: 1,
                title: 'Project Created',
                body: 'Hi {{userName}}, you created a new project: {{projectName}}',
                is_active: true,
            },
            {
                key: 'PROJECT_UPDATED',
                version: 1,
                title: 'Project Updated',
                body: 'Project "{{projectName}}" has been updated by {{updatedBy}}',
                is_active: true,
            },
            {
                key: 'PROJECT_DELETED',
                version: 1,
                title: 'Project Deleted',
                body: 'Project "{{projectName}}" has been deleted',
                is_active: true,
            },
            {
                key: 'MEMBER_ADDED',
                version: 1,
                title: 'Member Added',
                body: '{{memberName}} has been added to project "{{projectName}}" as {{role}}',
                is_active: true,
            },
            {
                key: 'MEMBER_REMOVED',
                version: 1,
                title: 'Member Removed',
                body: '{{memberName}} has been removed from project "{{projectName}}"',
                is_active: true,
            },
            {
                key: 'USER_CREATED',
                version: 1,
                title: 'New User Created',
                body: 'Welcome {{userName}}! Your account has been created successfully.',
                is_active: true,
            },
            {
                key: 'USER_UPDATED',
                version: 1,
                title: 'Profile Updated',
                body: 'Hi {{userName}}, your profile has been updated successfully.',
                is_active: true,
            },
        ];

        const promises = defaultTemplates.map(template => this.upsertTemplate(template));
        await Promise.all(promises);

        return { message: 'Default templates seeded successfully', count: defaultTemplates.length };
    }
}