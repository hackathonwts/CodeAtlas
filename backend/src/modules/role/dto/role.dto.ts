import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Policy } from 'src/modules/policy/schemas/policy.schema';
import { UserRoleEnum } from '../schemas/role.schema';

export class CreateRoleDto {
    @IsNotEmpty()
    @MaxLength(15, { message: 'Role is too long. Maximum length is $constraint1 characters.' })
    @IsEnum(UserRoleEnum, { message: 'Role must be a valid enum value. i.e [$constraint2]' })
    role: string;

    @IsOptional()
    @MaxLength(30, { message: 'Role display name is too long. Maximum length is $constraint1 characters.' })
    role_display_name: string;

    @IsOptional()
    @MaxLength(100, { message: 'Role description is too long. Maximum length is $constraint1 characters.' })
    desc: string;

    @IsOptional()
    policy: Policy[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
