import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_ABILITY, RequiredRule } from './casl.decorator';
import { IAuthUser } from 'src/modules/auth/user.repository';

@Injectable()
export class CaslGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const rules = this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler());
        
        // If no rules are defined, allow access
        if (!rules || rules.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: IAuthUser = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const ability = this.caslAbilityFactory.createForUser(user);

        // Check all required rules
        for (const rule of rules) {
            const isAllowed = ability.can(rule.action, rule.subject);
            
            if (!isAllowed) {
                throw new ForbiddenException(
                    `You are not allowed to ${rule.action} ${rule.subject}`
                );
            }
        }

        return true;
    }
}
