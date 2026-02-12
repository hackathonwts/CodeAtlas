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
    View = 'view',
}

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: IAuthUser) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.active_role?.policies) {
            this.applyPolicies(user.active_role.policies, can, cannot);
        }

        if (user.policies?.allow) {
            this.applyPolicies(user.policies.allow, can, cannot);
        }

        if (user.policies?.deny) {
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
                if (policy.fields && policy.fields.length > 0) {
                    cannot(action, subject, policy.conditions || {});
                } else if (policy.conditions) {
                    cannot(action, subject, policy.conditions);
                } else {
                    cannot(action, subject);
                }
            } else {
                if (policy.fields && policy.fields.length > 0) {
                    can(action, subject, policy.fields);
                } else if (policy.conditions) {
                    can(action, subject, policy.conditions);
                } else {
                    can(action, subject);
                }
            }
        });
    }
}
