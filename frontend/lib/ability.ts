import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability'
import { IPolicy, Action } from '@/interfaces/policy.interface'
import { IUser } from '@/interfaces/user.interface'

export type AppAbility = MongoAbility<[Action, any]>;

export function createAbilityForUser(user: IUser): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.active_role?.policies) {
        applyPolicies(user.active_role.policies, can, cannot);
    }

    if (user.policies?.allow) {
        applyPolicies(user.policies.allow, can, cannot);
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

    return build();
}

function applyPolicies(
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
