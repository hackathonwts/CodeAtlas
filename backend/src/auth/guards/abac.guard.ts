import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRoleEnum } from 'src/role/schemas/role.schema';
import { ABAC_POLICY_KEY } from '../decorators/abac.decorator';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';

export interface AbacPolicy {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

@Injectable()
export class AbacGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPolicy = this.reflector.get<AbacPolicy>(ABAC_POLICY_KEY, context.getHandler());
        if (!requiredPolicy) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as LoggedInUser;
        if (!user || !user.active_role) throw new ForbiddenException('User or active role not found');
        if (user.active_role?.role === UserRoleEnum.Admin) {
            return true;
        }

        const userAllowPolicies: AbacPolicy[] = user.policy?.allow || [];
        const userDenyPolicies: AbacPolicy[] = user.policy?.deny || [];
        const rolePolicies: AbacPolicy[] = user.active_role.policy || [];

        const denyMatch = this.findMatchingPolicy(userDenyPolicies, requiredPolicy);
        if (denyMatch) throw new ForbiddenException(`Access denied by user policy`);

        const userAllowMatch = this.findMatchingPolicy(userAllowPolicies, requiredPolicy);
        if (userAllowMatch) {
            if (this.checkConditions(requiredPolicy, userAllowMatch, request, user)) {
                return true;
            }
            throw new ForbiddenException('Access denied: User policy conditions not met');
        }

        const roleMatch = this.findMatchingPolicy(rolePolicies, requiredPolicy);
        if (!roleMatch) {
            throw new ForbiddenException(`Access denied: No policy found for ${requiredPolicy.action} on ${requiredPolicy.resource}`);
        }
        if (!this.checkConditions(requiredPolicy, roleMatch, request, user)) {
            throw new ForbiddenException('Access denied: Role policy conditions not met');
        }
        return true;
    }

    private findMatchingPolicy(policies: AbacPolicy[], required: AbacPolicy): AbacPolicy | null {
        return policies.find((p) => p.resource === required.resource && p.action === required.action) || null;
    }

    private checkConditions(requiredPolicy: AbacPolicy, matchingPolicy: AbacPolicy, request: Request, user: LoggedInUser): boolean {
        if (!requiredPolicy.conditions) return true;

        return this.evaluateConditions(requiredPolicy.conditions, matchingPolicy.conditions || {}, request, user);
    }

    private evaluateConditions(requiredConditions: Record<string, any>, policyConditions: Record<string, any>, request: Request, user: LoggedInUser): boolean {
        if (requiredConditions.ownership) {
            const resourceOwnerId = request.params?.userId || request.body?.userId || request.params?.id;
            if (policyConditions.ownership === 'own' && resourceOwnerId?.toString() !== user._id.toString()) {
                return false;
            }
        }

        if (requiredConditions.resource_field) {
            const fieldValue = request.body?.[requiredConditions.resource_field];
            const allowedValues = policyConditions[requiredConditions.resource_field];
            if (Array.isArray(allowedValues) && !allowedValues.includes(fieldValue)) {
                return false;
            }
        }

        if (requiredConditions.attributes) {
            for (const [key, value] of Object.entries(requiredConditions.attributes)) {
                const policyValue = policyConditions[key];
                if (policyValue !== undefined && policyValue !== value) {
                    return false;
                }
            }
        }

        return true;
    }
}
