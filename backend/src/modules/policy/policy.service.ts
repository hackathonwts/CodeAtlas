import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Policy, PolicyDocument } from './schemas/policy.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
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

    async findAll() {
        return this.policyModel.find({ is_active: true }).select('-__v -createdAt -updatedAt').exec();
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
