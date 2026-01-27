import { Body, Controller, Delete, Get, Param, Post, Put, Query, Sse, UseGuards } from "@nestjs/common";
import { Observable, Subject } from 'rxjs';
import { NotificationService } from "./notification.service";
import { AuthGuard } from "@nestjs/passport";
import { AbacGuard } from "src/auth/guards/abac.guard";
import { RequireAbacPolicy } from "src/auth/decorators/abac.decorator";
import { NotificationTemplateKey } from "./schemas/notification-template.schema";
import { CreateNotificationTemplateDto } from "./dto/notification-template.dto";

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Sse('stream')
    streamForClient(@Query('clientId') clientId: string) {
        const subject = new Subject<MessageEvent>();
        this.notificationService.registerClient(clientId, subject);

        return new Observable<MessageEvent>((subscriber) => {
            const subscription = subject.subscribe(subscriber);

            return () => {
                subscription.unsubscribe();
                this.notificationService.unregisterClient(clientId);
            };
        });
    }

    @Get()
    findAll() {
        return this.notificationService.getAllNotifications();
    }

    @Put(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }

    @Delete(':id/delete')
    deleteNotification(@Param('id') id: string) {
        return this.notificationService.deleteNotification(id);
    }

    // Template Management Endpoints

    @Post('templates')
    @UseGuards(AuthGuard('jwt'), AbacGuard)
    @RequireAbacPolicy({ resource: 'notification', action: 'create' })
    createOrUpdateTemplate(@Body() body: CreateNotificationTemplateDto) {
        return this.notificationService.upsertTemplate(body);
    }

    @Get('templates')
    @UseGuards(AuthGuard('jwt'), AbacGuard)
    @RequireAbacPolicy({ resource: 'notification', action: 'read' })
    getTemplates() {
        return this.notificationService.getTemplates();
    }

    @Get('templates/:key')
    @UseGuards(AuthGuard('jwt'), AbacGuard)
    @RequireAbacPolicy({ resource: 'notification', action: 'read' })
    getTemplateByKey(@Param('key') key: string) {
        return this.notificationService.getTemplateByKey(key as NotificationTemplateKey);
    }

    @Delete('templates/:key')
    @UseGuards(AuthGuard('jwt'), AbacGuard)
    @RequireAbacPolicy({ resource: 'notification', action: 'delete' })
    deleteTemplate(@Param('key') key: string) {
        return this.notificationService.deleteTemplate(key as NotificationTemplateKey);
    }

    @Post('templates/seed')
    @UseGuards(AuthGuard('jwt'), AbacGuard)
    @RequireAbacPolicy({ resource: 'notification', action: 'create' })
    seedTemplates() {
        return this.notificationService.seedTemplates();
    }
}
