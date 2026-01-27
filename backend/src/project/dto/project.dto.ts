import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateProjectDto {
    @IsNotEmpty()
    @MaxLength(50, { message: 'Title is too long. Maximum length is $constraint1 characters.' })
    title?: string;

    @IsOptional()
    @MaxLength(500, { message: 'Description is too long. Maximum length is $constraint1 characters.' })
    description?: string;

    @IsOptional()
    @MaxLength(50, { message: 'Language is too long. Maximum length is $constraint1 characters.' })
    language?: string;

    @IsNotEmpty()
    @IsUrl({ protocols: ['http', 'https'] }, { message: 'Repository link must be a valid http/https URL.' })
    git_link?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class AddMemberDto {
    @IsNotEmpty()
    @IsMongoId({ message: 'User ID must be a valid Mongo ID.' })
    user_id!: string;

    @IsNotEmpty()
    project_role!: string;
}
