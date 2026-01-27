import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddPoliciesToRoleDto, RemovePoliciesFromRoleDto } from 'src/policy/dto/policy.dto';

@Injectable()
export class RoleService {
    constructor(@InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>) {}

    async create(createRoleDto: CreateRoleDto) {
        const existingRole = await this.roleModel.findOne({ role: createRoleDto.role, is_deleted: false });
        if (existingRole) {
            throw new Error('Role already exists');
        }
        const role = new this.roleModel(createRoleDto);
        return role.save();
    }

    async findAll() {
        return this.roleModel.find({ is_deleted: false, role: { $ne: 'admin' } }).exec();
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

    async addPolicies(id: string, addPoliciesToRoleDto: AddPoliciesToRoleDto) {
        const role = await this.roleModel.findOne({ _id: id, is_deleted: false }).exec();
        if (!role) throw new BadRequestException('Role not found');

        const existingPolicies = role.policy || [];
        const newPolicies = addPoliciesToRoleDto.policies.filter((newPolicy) => {
            return !existingPolicies.some((existing) => existing.resource === newPolicy.resource && existing.action === newPolicy.action);
        });

        if (newPolicies.length === 0) return role;
        const updated = await this.roleModel.findOneAndUpdate({ _id: id, is_deleted: false }, { $push: { policy: { $each: newPolicies } } }, { new: true }).exec();

        return updated;
    }

    async removePolicies(id: string, removePoliciesFromRoleDto: RemovePoliciesFromRoleDto) {
        const role = await this.roleModel.findOne({ _id: id, is_deleted: false }).exec();
        if (!role) throw new BadRequestException('Role not found');

        const policiesToRemove = removePoliciesFromRoleDto.policies;
        const updatedPolicies = role.policy.filter((policy) => {
            return !policiesToRemove?.some((remove) => remove.resource === policy.resource && remove.action === policy.action);
        });

        const updated = await this.roleModel.findOneAndUpdate({ _id: id, is_deleted: false }, { $set: { policy: updatedPolicies } }, { new: true }).exec();

        return updated;
    }
}
