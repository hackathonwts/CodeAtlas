import { Controller, Post, Body, Res, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import type { Response } from 'express';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ADMIN_AUTH_TOKEN_NAME } from 'src/common/constants';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(200)
    login(@Res() res: Response, @Body() body: LoginDto) {
        return this.authService.login(res, body);
    }

    @Post('signup')
    @HttpCode(200)
    signup(@Res() res: Response, @Body() body: CreateUserDto) {
        return this.authService.signup(res, body);
    }

    @Post('logout')
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'))
    logout(@Res() res: Response) {
        res.clearCookie(ADMIN_AUTH_TOKEN_NAME);
        return res.send({ message: 'Logout successful' });
    }
}
