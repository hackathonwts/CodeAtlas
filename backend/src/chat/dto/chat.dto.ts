import { IsNotEmpty, IsString, MaxLength, IsMongoId } from 'class-validator';

export class CreateChatDto {
    @IsNotEmpty()
    @IsMongoId({ message: 'Project ID must be a valid Mongo ID.' })
    project_id: string;
}

export class UpdateChatDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50, { message: 'Title is too long. Maximum length is $constraint1 characters.' })
    title?: string;
}

export class ConverseDto {
    @IsString()
    @MaxLength(200, { message: 'Prompt is too long. Maximum length is $constraint1 characters.' })
    prompt: string;
}