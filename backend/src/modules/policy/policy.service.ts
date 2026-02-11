import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { Policy, PolicyDocument } from './schemas/policy.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreatePolicyDto, UpdatePolicyDto, AddPoliciesToUserDto } from './dto/policy.dto';
import { CHECK_ABILITY } from 'src/casl/casl.decorator';
import { RequiredRule } from 'src/casl/casl.decorator';

@Injectable()
export class PolicyService implements OnModuleInit {
    private permissions: { subject: string; action: string }[] = [];

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        @InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>,
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    onModuleInit() {
        this.scanControllers();
    }

    async create(createPolicyDto: CreatePolicyDto) {
        const policy = new this.policyModel(createPolicyDto);
        return policy.save();
    }

    async findAll() {
        return this.policyModel.find().select('-__v -createdAt -updatedAt').exec();
    }

    async findOne(id: string) {
        const policy = await this.policyModel.findById(id).exec();
        if (!policy) {
            throw new NotFoundException(`Policy with ID ${id} not found`);
        }
        return policy;
    }

    async update(id: string, updatePolicyDto: UpdatePolicyDto) {
        const policy = await this.policyModel
            .findByIdAndUpdate(id, updatePolicyDto, { new: true })
            .exec();
        if (!policy) {
            throw new NotFoundException(`Policy with ID ${id} not found`);
        }
        return policy;
    }

    async remove(id: string) {
        const result = await this.policyModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Policy with ID ${id} not found`);
        }
        return { message: 'Policy deleted successfully' };
    }

    async addPoliciesToUser(userId: string, dto: AddPoliciesToUserDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Create policies if they don't exist
        const allowPolicyIds: Types.ObjectId[] = [];
        const denyPolicyIds: Types.ObjectId[] = [];

        if (dto.allow && dto.allow.length > 0) {
            for (const policyDto of dto.allow) {
                const policy = await this.policyModel.create(policyDto);
                allowPolicyIds.push(policy._id as Types.ObjectId);
            }
        }

        if (dto.deny && dto.deny.length > 0) {
            for (const policyDto of dto.deny) {
                const policy = await this.policyModel.create(policyDto);
                denyPolicyIds.push(policy._id as Types.ObjectId);
            }
        }

        // Update user's policies
        if (!user.policies) {
            user.policies = { allow: [], deny: [] };
        }

        if (allowPolicyIds.length > 0) {
            user.policies.allow = [...(user.policies.allow || []), ...allowPolicyIds];
        }

        if (denyPolicyIds.length > 0) {
            user.policies.deny = [...(user.policies.deny || []), ...denyPolicyIds];
        }

        await user.save();
        return this.userModel.findById(userId)
            .populate('policies.allow')
            .populate('policies.deny')
            .exec();
    }

    async removePoliciesFromUser(userId: string, dto: AddPoliciesToUserDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Remove policies based on matching criteria
        if (dto.allow && dto.allow.length > 0) {
            const policesToRemove = await this.policyModel.find({
                _id: { $in: user.policies?.allow || [] }
            });

            const idsToRemove = policesToRemove
                .filter(p => dto.allow?.some(d =>
                    d.action === p.action && d.subject === p.subject
                ))
                .map(p => p._id.toString());

            user.policies.allow = (user.policies?.allow || []).filter(
                id => !idsToRemove.includes(id.toString())
            );
        }

        if (dto.deny && dto.deny.length > 0) {
            const policesToRemove = await this.policyModel.find({
                _id: { $in: user.policies?.deny || [] }
            });

            const idsToRemove = policesToRemove
                .filter(p => dto.deny?.some(d =>
                    d.action === p.action && d.subject === p.subject
                ))
                .map(p => p._id.toString());

            user.policies.deny = (user.policies?.deny || []).filter(
                id => !idsToRemove.includes(id.toString())
            );
        }

        await user.save();
        return this.userModel.findById(userId)
            .populate('policies.allow')
            .populate('policies.deny')
            .exec();
    }

    async resolvePolicies(user: QueryFilter<UserDocument>) {
        const role = await this.roleModel.findById(user.active_role).populate('policies');
        const userPolicies = await this.policyModel.find({ _id: { $in: [user._id as string] } });

        return [
            ...(role?.policies || []),
            ...userPolicies,
        ];
    }

    getPermissions() {
        return this.permissions;
    }

    async rediscoverPolicies(): Promise<{ discovered: number; existing: number }> {
        this.permissions = [];
        this.scanControllers();

        const discovered = this.permissions;
        const existingPolicies = await this.policyModel.find().exec();

        const newPolicies = discovered.filter(d => {
            return !existingPolicies.some(e =>
                e.action === d.action && e.subject === d.subject
            );
        });

        if (newPolicies.length > 0) {
            const policiesToInsert = newPolicies.map(p => ({
                action: p.action,
                subject: p.subject,
                inverted: false,
                reason: `Auto-discovered from ${p.subject} controller`
            }));

            await this.policyModel.insertMany(policiesToInsert);
        }

        return {
            discovered: newPolicies.length,
            existing: existingPolicies.length
        };
    }

    private scanControllers() {
        const controllers = this.discoveryService.getControllers();

        for (const wrapper of controllers) {
            const instance = wrapper.instance;
            const metatype = wrapper.metatype;

            if (!instance || !metatype) continue;

            const controllerPath = this.reflector.get<string>(PATH_METADATA, metatype);
            if (!controllerPath) continue;

            const subject = this.normalizeSubject(controllerPath);

            this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (methodName) => {
                const methodRef = instance[methodName];

                // Only discover policies from explicit @CheckAbilities decorators
                const requiredRules = this.reflector.get<RequiredRule[]>(CHECK_ABILITY, methodRef);

                if (requiredRules && requiredRules.length > 0) {
                    requiredRules.forEach(rule => {
                        this.permissions.push({
                            subject: rule.subject,
                            action: rule.action,
                        });
                    });
                }
            });
        }
        this.permissions = this.uniquePermissions(this.permissions);
    }

    private normalizeSubject(path: string): string {
        const cleaned = path.replace(/^\//, '').replace(/\/.*/, '');
        return cleaned
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('');
    }

    private uniquePermissions(list: { subject: string; action: string }[]) {
        const map = new Map<string, boolean>();

        return list.filter((p) => {
            const key = `${p.subject}:${p.action}`;
            if (map.has(key)) return false;
            map.set(key, true);
            return true;
        });
    }
}
