import { Injectable } from "@nestjs/common";
import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from '@casl/ability';
import { User } from "src/modules/user/schemas/user.schema";
import { Project } from "src/modules/project/schemas/project.schema";
import { UserRoleEnum } from "src/modules/role/schemas/role.schema";
import { IAuthUser } from "src/modules/auth/user.repository";
import { IPolicy } from "src/modules/policy/policy.interface";

type Subjects = InferSubjects<typeof Project | typeof User> | 'all';

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: IAuthUser) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        // Start with role policies if active_role exists
        if (user.active_role?.policies) {
            this.applyPolicies(user.active_role.policies, can, cannot);
        }

        // Apply user-specific allow policies (these override role policies)
        if (user.policies?.allow) {
            this.applyPolicies(user.policies.allow, can, cannot);
        }

        // Apply user-specific deny policies (these have highest priority)
        if (user.policies?.deny) {
            // Deny policies are inverted by default
            user.policies.deny.forEach(policy => {
                const action = policy.action as Action;
                const subject = policy.subject as any;
                
                if (policy.conditions) {
                    cannot(action, subject, policy.conditions);
                } else {
                    cannot(action, subject);
                }
            });
        }

        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>
        });
    }

    private applyPolicies(
        policies: IPolicy[],
        can: (action: Action, subject: any, conditionsOrFields?: any) => void,
        cannot: (action: Action, subject: any, conditionsOrFields?: any) => void
    ) {
        policies.forEach(policy => {
            const action = policy.action as Action;
            const subject = policy.subject as any;
            
            if (policy.inverted) {
                // This is a "cannot" rule
                if (policy.fields && policy.fields.length > 0) {
                    // CASL doesn't fully support field-level "cannot" with conditions together
                    // We apply the condition if it exists
                    cannot(action, subject, policy.conditions || {});
                } else if (policy.conditions) {
                    cannot(action, subject, policy.conditions);
                } else {
                    cannot(action, subject);
                }
            } else {
                // This is a "can" rule
                if (policy.fields && policy.fields.length > 0) {
                    // Field-level permissions
                    // Note: CASL handles fields differently; they're specified in the third parameter
                    can(action, subject, policy.fields);
                } else if (policy.conditions) {
                    // Conditional permissions
                    can(action, subject, policy.conditions);
                } else {
                    // Simple permissions
                    can(action, subject);
                }
            }
        });
    }
}
