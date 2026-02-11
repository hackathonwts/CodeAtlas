import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, Put, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, emailChangeDto, EmailVerificationDto, UpdatePersonalInfoDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { IUser } from './schemas/user.schema';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private readonly userService: UserService) {}

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
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    findAll(@Req() req: Request) {
        return this.userService.findAll(req);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
