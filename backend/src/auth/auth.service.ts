import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserStatus } from 'src/user/schemas/user.schema';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { ADMIN_AUTH_TOKEN_NAME } from 'src/common/constants';
import { Role, RoleDocument, UserRoleEnum } from 'src/role/schemas/role.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async login(res: Response, body: LoginDto) {
    const { email, password } = body;
    const user = await this.userModel.findOne({ email, is_deleted: false });

    if (!user) throw new BadRequestException('Invalid credentials or user does not exist');
    if (!user.validPassword(password)) throw new BadRequestException('Invalid credentials or user does not exist');
    if (user.status !== UserStatus.Active) throw new BadRequestException('Your access has been disabled, please contact admin');
    if (!user.roles?.length) throw new BadRequestException('User has no roles assigned');

    if (!user.active_role) {
      await this.userModel.findOneAndUpdate(
        { _id: user._id, active_role: { $exists: false } },
        { $set: { active_role: user.roles[0] } },
        { new: true }
      );
    }

    const payload: { id: string } = {
      id: user._id.toString(),
    };

    const access_token = this.jwtService.sign(payload);
    res.cookie(ADMIN_AUTH_TOKEN_NAME, access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
    });

    return res.send({ message: 'Login successful', data: user });
  }

  async signup(res: Response, body: CreateUserDto) {
    const { email, password, full_name } = body;
    const existing_user = await this.userModel.findOne({ email, is_deleted: false });
    if (existing_user) throw new BadRequestException('User already exists');

    const def_role = await this.roleModel.findOne({ role: UserRoleEnum.User, is_deleted: false });
    if (!def_role) throw new BadRequestException('Default role not found');

    const new_user = await this.userModel.create({ email, password, full_name, roles: [def_role._id], active_role: def_role._id });
    const payload: { id: string } = {
      id: new_user._id.toString(),
    };

    const access_token = this.jwtService.sign(payload);
    res.cookie(ADMIN_AUTH_TOKEN_NAME, access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
    });
    return res.send({ message: 'Signup successful', data: new_user });
  }
}
