import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import type { NotificationTemplateKey } from '../schemas/notification-template.schema';

export class CreateNotificationTemplateDto {
    @IsEnum(['PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'USER_CREATED', 'USER_UPDATED'])
    key: NotificationTemplateKey;

    @IsNumber()
    @IsOptional()
    version: number = 1;

    @IsString()
    @MaxLength(100)
    title: string;

    @IsString()
    @MaxLength(500)
    body: string;

    @IsBoolean()
    @IsOptional()
    is_active: boolean = true;
}

export class UpdateNotificationTemplateDto {
    @IsNumber()
    @IsOptional()
    version?: number;

    @IsString()
    @MaxLength(100)
    @IsOptional()
    title?: string;

    @IsString()
    @MaxLength(500)
    @IsOptional()
    body?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
