import { SetMetadata } from '@nestjs/common';
import { Action } from './casl-ability.factory';

export interface RequiredRule {
    action: Action;
    subject: string;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (...requirements: RequiredRule[]) => 
    SetMetadata(CHECK_ABILITY, requirements);

// Helper function for common permission patterns
export class AbilityDecorators {
    static ReadAll(subject: string) {
        return CheckAbilities({ action: Action.Read, subject });
    }

    static CreateAll(subject: string) {
        return CheckAbilities({ action: Action.Create, subject });
    }

    static UpdateAll(subject: string) {
        return CheckAbilities({ action: Action.Update, subject });
    }

    static DeleteAll(subject: string) {
        return CheckAbilities({ action: Action.Delete, subject });
    }

    static ManageAll(subject: string) {
        return CheckAbilities({ action: Action.Manage, subject });
    }
}
