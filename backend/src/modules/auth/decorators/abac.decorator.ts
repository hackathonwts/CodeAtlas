import { SetMetadata } from '@nestjs/common';

export interface AbacPolicy {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

export const RequireAbacPolicy = (policy: AbacPolicy) => SetMetadata(ABAC_POLICY_KEY, policy);
export const ABAC_POLICY_KEY = 'abac-policy';
