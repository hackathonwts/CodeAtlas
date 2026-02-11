import { Injectable } from "@nestjs/common";
import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from '@casl/ability';
import { User } from "src/modules/user/schemas/user.schema";
import { Project } from "src/modules/project/schemas/project.schema";
import { UserRoleEnum } from "src/modules/role/schemas/role.schema";
import { IAuthUser } from "src/modules/auth/user.repository";

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

        if (user.active_role?.role === UserRoleEnum.User) {
            can(Action.Manage, 'all');
        } else {
            can(Action.Read, 'all');
        }

        can(Action.Update, Project.name, { created_by: user._id });

        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>
        });
    }
}
