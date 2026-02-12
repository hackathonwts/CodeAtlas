import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Policy, PolicyDocument } from '../policy/schemas/policy.schema';

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>
    ) { }

    async create(createRoleDto: CreateRoleDto) {
        const existingRole = await this.roleModel.findOne({ role: createRoleDto.role, is_deleted: false });
        if (existingRole) {
            throw new Error('Role already exists');
        }
        const role = new this.roleModel(createRoleDto);
        return role.save();
    }

    async findAll() {
        return this.roleModel
            .find({ is_deleted: false, role: { $ne: 'admin' } })
            .populate({
                path: 'policies',
                select: 'action subject fields conditions inverted reason'
            })
            .exec();
    }

    async findOne(id: string) {
        const role = await this.roleModel.findOne({ _id: id, is_deleted: false }).exec();
        if (!role) {
            throw new Error('Role not found');
        }
        return role;
    }

    async update(id: string, updateRoleDto: UpdateRoleDto) {
        const role = await this.roleModel.findOneAndUpdate({ _id: id, is_deleted: false }, { $set: updateRoleDto }, { new: true }).exec();
        if (!role) {
            throw new Error('Role not found');
        }
        return role;
    }

    async remove(id: string) {
        const role = await this.roleModel.findOneAndUpdate({ _id: id, is_deleted: false }, { $set: { is_deleted: true } }, { new: true }).exec();
        if (!role) {
            throw new Error('Role not found');
        }
        return role;
    }
}
