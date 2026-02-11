import { PartialType } from '@nestjs/mapped-types';
import { IPolicy } from '../policy.interface';
import { IsOptional, IsString, IsBoolean, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePolicyDto implements IPolicy {
    @IsString()
    action: string;

    @IsString()
    subject: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    fields?: string[];

    @IsOptional()
    @IsObject()
    conditions?: any;

    @IsOptional()
    @IsBoolean()
    inverted?: boolean;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}

export class AddPoliciesToRoleDto {
    @IsOptional()
    @IsArray()
    @Type(() => CreatePolicyDto)
    policies: CreatePolicyDto[];
}

export class RemovePoliciesFromRoleDto extends PartialType(AddPoliciesToRoleDto) {}

export class AddPoliciesToUserDto {
    @IsOptional()
    @IsArray()
    @Type(() => CreatePolicyDto)
    allow?: CreatePolicyDto[];

    @IsOptional()
    @IsArray()
    @Type(() => CreatePolicyDto)
    deny?: CreatePolicyDto[];
}
