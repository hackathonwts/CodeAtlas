import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, Put, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, emailChangeDto, EmailVerificationDto, UpdatePersonalInfoDto, UpdateUserDto } from './dto/user.dto';
import type { Request, Response } from 'express';
import { IUser } from './schemas/user.schema';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckAbilities } from 'src/casl/casl.decorator';
import { Action } from 'src/casl/casl-ability.factory';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    @HttpCode(200)
    getMe(@LoggedInUser() user: Partial<IUser>) {
        return this.userService.getMe(user);
    }

    @Put('personal-info')
    @HttpCode(200)
    updatePersonalInfo(@LoggedInUser() user: Partial<IUser>, @Body() body: UpdatePersonalInfoDto) {
        return this.userService.updatePersonalInfo(user, body);
    }

    @Post('switch-role')
    @HttpCode(200)
    switchRole(@Body('roleId') roleId: string, @LoggedInUser() user: Partial<IUser>) {
        return this.userService.switchUserRole(user, roleId);
    }

    @Post('verify-email')
    @HttpCode(200)
    verifyEmail(@Body() dto: EmailVerificationDto, @LoggedInUser() user: Partial<IUser>) {
        return this.userService.verifyEmail(user, dto);
    }

    @Post('change-email')
    @HttpCode(200)
    changeEmail(@Res() res: Response, @LoggedInUser() user: Partial<IUser>, @Body() body: emailChangeDto) {
        return this.userService.changeEmail(res, user, body);
    }

    @Post()
    @CheckAbilities({ action: Action.Create, subject: 'User' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @CheckAbilities({ action: Action.View, subject: 'User' })
    findAll(@Req() req: Request) {
        return this.userService.findAll(req);
    }

    @Get(':id')
    @CheckAbilities({ action: Action.Read, subject: 'User' })
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    @CheckAbilities({ action: Action.Update, subject: 'User' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @CheckAbilities({ action: Action.Delete, subject: 'User' })
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
