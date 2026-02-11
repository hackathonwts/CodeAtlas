import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CHECK_POLICIES_KEY, PolicyHandler } from "./casl.decorator";
import { AppAbility, CaslAbilityFactory } from "./casl-ability.factory";
import { Reflector } from "@nestjs/core";

@Injectable()
export class CaslGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];
        console.log("policyHandlers: ", policyHandlers);

        const { user } = context.switchToHttp().getRequest();
        const ability = this.caslAbilityFactory.createForUser(user) as AppAbility;
        console.log("ability: ", ability);
        return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));
    }

    private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
        if (typeof handler === 'function') {
            return handler(ability);
        }
        return handler.handle(ability);
    }
}
