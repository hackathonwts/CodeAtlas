import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, Max, MaxLength, MinLength, ValidateIf } from "class-validator";
import { Policy } from "src/policy/schemas/policy.schema";

export class CreateUserDto {
    @IsNotEmpty()
    @MaxLength(50, { message: 'Full name is too long. Maximum length is $constraint1 characters.' })
    full_name: string;

    @IsEmail()
    @MaxLength(50, { message: 'Email is too long. Maximum length is $constraint1 characters.' })
    email: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'Password is too short. Minimum length is $constraint1 characters.' })
    password: string;

    @IsOptional()
    policy: Policy[];
}

export class EmailVerificationDto {
    @IsNotEmpty()
    @MaxLength(50, { message: 'Email is too long. Maximum length is $constraint1 characters.' })
    new_email: string;
}

export class emailChangeDto {
    @IsEmail()
    @MaxLength(50, { message: 'Email is too long. Maximum length is $constraint1 characters.' })
    new_email: string;

    @IsNotEmpty()
    @IsNumber()
    @Max(999999, { message: 'OTP must be a 6-digit number.' })
    otp: number;
}

export class UpdatePersonalInfoDto {
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(50, { message: 'Full name is too long. Maximum length is $constraint1 characters.' })
    full_name?: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'Password is too short. Minimum length is $constraint1 characters.' })
    @ValidateIf((o) => o.old_password !== undefined)
    password?: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'Old password is too short. Minimum length is $constraint1 characters.' })
    @ValidateIf((o) => o.password !== undefined)
    old_password?: string;
}


export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    status?: string;

    @IsOptional()
    policy?: Policy[];
}
