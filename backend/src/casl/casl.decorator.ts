import { SetMetadata } from '@nestjs/common';
import { Action } from './casl-ability.factory';

export interface RequiredRule {
    action: Action;
    subject: string;
}

export const CHECK_ABILITY = Symbol('check_ability');

export const CheckAbilities = (...requirements: RequiredRule[]) =>
    SetMetadata(CHECK_ABILITY, requirements);
