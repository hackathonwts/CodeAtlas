import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, emailChangeDto, EmailVerificationDto, UpdatePersonalInfoDto, UpdateUserDto } from './dto/user.dto';
import { IUser, User, UserDocument, UserStatus } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Request, Response } from 'express';
import { NotificationService } from 'src/notification/notification.service';
import { Role, RoleDocument, UserRoleEnum } from 'src/role/schemas/role.schema';
import { ADMIN_AUTH_TOKEN_NAME } from 'src/common/constants';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
        private readonly notificationService: NotificationService,
    ) {}

    async getMe(user: Partial<IUser>) {
        const user_data = await this.userModel
            .findById(user._id)
            .where({ is_deleted: false })
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            });

        if (!user_data) throw new BadRequestException('User not found');
        return { message: 'User fetched successfully', data: user_data };
    }

    async updatePersonalInfo(user: Partial<IUser>, body: UpdatePersonalInfoDto) {
        const user_data = await this.userModel.findById(user._id).where({ is_deleted: false, status: UserStatus.Active });
        if (!user_data) throw new UnauthorizedException('User not found');

        const updateObject: Partial<UpdatePersonalInfoDto> = {};
        if (body.password && body.old_password) {
            if (!user_data.validPassword(body.old_password)) throw new BadRequestException('Old password is incorrect');
            updateObject.password = body.password;
        }

        if (body.full_name) {
            updateObject.full_name = body.full_name;
        }

        const updated_user = await this.userModel
            .findOneAndUpdate({ _id: user._id }, { $set: updateObject }, { new: true })
            .where({ is_deleted: false })
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name policy desc',
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name policy desc',
            });

        return { message: 'Personal info updated successfully', data: updated_user };
    }

    async switchUserRole(user: Partial<IUser>, roleId: string) {
        const user_data = await this.userModel.findById(user._id).where({ is_deleted: false, status: UserStatus.Active });
        if (!user_data) throw new UnauthorizedException('User not found');

        const role = await this.roleModel.findById(roleId).where({ is_deleted: false });
        if (!role) throw new BadRequestException('Role not found');

        if (!user_data.roles?.map((r) => r.toString()).includes(roleId)) {
            throw new BadRequestException('User does not have the specified role');
        }

        user_data.active_role = role._id;
        await user_data.save();

        const updated_user = this.userModel
            .findById(user._id)
            .where({ is_deleted: false })
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name policy desc',
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name policy desc',
            });

        return updated_user;
    }

    async verifyEmail(user: Partial<IUser>, body: EmailVerificationDto) {
        const user_data = await this.userModel.findById(user._id).where({ is_deleted: false });
        if (!user_data) throw new UnauthorizedException('User not found');

        if (body.new_email === user_data.email) {
            throw new BadRequestException('New email cannot be the same as the current email');
        }

        const existing_user = await this.userModel.findOne({ email: body.new_email, is_deleted: false });
        if (existing_user) throw new BadRequestException('Email already in use by another user');

        const random_otp = Math.floor(100000 + Math.random() * 900000);
        user_data.email_verification_otp = random_otp;
        await user_data.save();

        return { message: 'Verification email sent successfully' };
    }

    async changeEmail(res: Response, user: Partial<IUser>, body: emailChangeDto) {
        const user_data = await this.userModel.findById(user._id).where({ is_deleted: false, status: UserStatus.Active });
        if (!user_data) throw new UnauthorizedException('User not found');

        const existing_user = await this.userModel.findOne({ email: body.new_email, is_deleted: false });
        if (existing_user) throw new BadRequestException('Email already in use by another user');

        if (body.otp !== user_data.email_verification_otp) throw new BadRequestException('You have entered an invalid OTP');

        user_data.email = body.new_email;
        user_data.email_verification_otp = null;
        await user_data.save();

        res.clearCookie(ADMIN_AUTH_TOKEN_NAME);
        res.status(200).send({ message: 'Email changed successfully, please log in via your new email' });
    }

    async create(createUserDto: CreateUserDto) {
        const createdUser = await new this.userModel(createUserDto).save();

        this.notificationService.sendWithTemplate(createdUser._id.toString(), 'USER_CREATED', {
            userName: createdUser.full_name,
        });

        return createdUser;
    }

    async findAll(req: Request) {
        const page_number = parseInt(req.query.page as string) || 1;
        const limit_number = parseInt(req.query.limit as string) || 100;
        const skip = (page_number - 1) * limit_number;
        const search = req.query.search as string;
        const admin_role = await this.roleModel.findOne({ role: UserRoleEnum.Admin, is_deleted: false });

        let filterQuery: QueryFilter<UserDocument> = { is_deleted: false };
        if (search) {
            filterQuery.$or = [{ full_name: { $regex: '^' + search, $options: 'i' } }, { email: { $regex: '^' + search, $options: 'i' } }];
        }

        if (admin_role) {
            filterQuery['roles'] = { $ne: admin_role._id };
        }

        const total_docs_query = this.userModel.countDocuments(filterQuery);
        const users_query = this.userModel
            .find(filterQuery)
            .select('-password -is_deleted -updatedAt -__v')
            .skip(skip)
            .limit(limit_number)
            .sort({ createdAt: -1 })
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            });

        const [users, total_docs] = await Promise.all([users_query.exec(), total_docs_query]);

        const total_pages = Math.ceil(total_docs / limit_number);

        return {
            data: users,
            page: page_number,
            limit: limit_number,
            total_pages: total_pages,
            total_count: total_docs,
            message: 'Users fetched successfully',
        };
    }

    findOne(id: string) {
        return this.userModel
            .findById(id)
            .select('-password -is_deleted -__v')
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, { ...updateUserDto, updatedAt: new Date() }, { new: true })
            .select('-password -is_deleted -__v')
            .populate({
                path: 'active_role',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            })
            .populate({
                path: 'roles',
                match: { is_deleted: false },
                select: 'role role_display_name desc',
            });

        if (updatedUser) {
            this.notificationService.sendWithTemplate(updatedUser._id.toString(), 'USER_UPDATED', {
                userName: updatedUser.full_name,
            });
        }

        return updatedUser;
    }

    remove(id: string) {
        return this.userModel.findByIdAndUpdate(id, { is_deleted: true, updatedAt: new Date() }, { new: true });
    }
}
