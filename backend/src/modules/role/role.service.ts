import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddPoliciesToRoleDto, RemovePoliciesFromRoleDto } from 'src/modules/policy/dto/policy.dto';
import { Policy, PolicyDocument } from '../policy/schemas/policy.schema';

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
        @InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>,
    ) {}

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
        if (!role) throw new NotFoundException('Role not found');

        // Create new policies and get their IDs
        const policyIds: Types.ObjectId[] = [];
        for (const policyDto of addPoliciesToRoleDto.policies) {
            const policy = await this.policyModel.create(policyDto);
            policyIds.push(policy._id as Types.ObjectId);
        }

        // Add to role's policies array
        const updated = await this.roleModel
            .findOneAndUpdate(
                { _id: id, is_deleted: false },
                { $addToSet: { policies: { $each: policyIds } } },
                { new: true }
            )
            .populate('policies')
            .exec();

        return updated;
    }

    async removePolicies(id: string, removePoliciesFromRoleDto: RemovePoliciesFromRoleDto) {
        const role = await this.roleModel.findOne({ _id: id, is_deleted: false }).populate('policies').exec();
        if (!role) throw new NotFoundException('Role not found');

        // Find policies to remove based on action and subject
        const policiesToRemove = (role.policies as any[]).filter((policy: any) => {
            return removePoliciesFromRoleDto.policies?.some((remove) => 
                remove.action === policy.action && remove.subject === policy.subject
            );
        });

        const policyIdsToRemove = policiesToRemove.map((p: any) => p._id);

        // Remove from role's policies array
        const updated = await this.roleModel
            .findOneAndUpdate(
                { _id: id, is_deleted: false },
                { $pull: { policies: { $in: policyIdsToRemove } } },
                { new: true }
            )
            .populate('policies')
            .exec();

        // Optionally delete the policies from the database
        await this.policyModel.deleteMany({ _id: { $in: policyIdsToRemove } });

        return updated;
    }
}
