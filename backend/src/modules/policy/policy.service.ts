import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Policy, PolicyDocument } from './schemas/policy.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { IUser } from '../user/schemas/user.schema';

@Injectable()
export class PolicyService implements OnModuleInit {
    private permissions: { resource: string; action: string }[] = [];

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        @InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>,
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    ) { }

    onModuleInit() {
        this.scanControllers();
    }

    async resolvePolicies(user: QueryFilter<IUser>) {
        const role = await this.roleModel.findById(user.active_role).populate('policies');
        const userPolicies = await this.policyModel.find({ _id: { $in: [user._id as string] } });

        return [
            ...(role?.policies || []),
            ...userPolicies,
        ];
    }

    async findAll() {
        return this.policyModel.find().select('-__v -createdAt -updatedAt').exec();
    }

    getPermissions() {
        return this.permissions;
    }

    private scanControllers() {
        const controllers = this.discoveryService.getControllers();

        for (const wrapper of controllers) {
            const instance = wrapper.instance;
            const metatype = wrapper.metatype;

            if (!instance || !metatype) continue;

            const controllerPath = this.reflector.get<string>(PATH_METADATA, metatype);
            if (!controllerPath) continue;

            const resource = this.normalizeResource(controllerPath);

            this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (methodName) => {
                const methodRef = instance[methodName];

                const routePath = this.reflector.get<string>(PATH_METADATA, methodRef);
                const requestMethod = this.reflector.get<number>(METHOD_METADATA, methodRef);

                if (routePath === undefined || requestMethod === undefined) return;

                const action = this.mapHttpMethodToAction(requestMethod, routePath);
                if (!action) return;

                this.permissions.push({
                    resource,
                    action,
                });
            });
        }
        this.permissions = this.uniquePermissions(this.permissions);
    }

    private mapHttpMethodToAction(method: number, routePath: string): string | null {
        switch (method) {
            case 0:
                return 'read';
            case 1:
                return 'create';
            case 2:
            case 4:
                return 'update';
            case 3:
                return 'delete';
            default:
                return null;
        }
    }

    private normalizeResource(path: string): string {
        return path.replace(/^\//, '').replace(/\/.*/, '').toLowerCase();
    }

    private uniquePermissions(list: { resource: string; action: string }[]) {
        const map = new Map<string, boolean>();

        return list.filter((p) => {
            const key = `${p.resource}:${p.action}`;
            if (map.has(key)) return false;
            map.set(key, true);
            return true;
        });
    }
}
