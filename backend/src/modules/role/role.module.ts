import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/schemas/user.schema';
import { Role, RoleSchema } from 'src/modules/role/schemas/role.schema';
import { Policy, PolicySchema } from '../policy/schemas/policy.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Policy.name, schema: PolicySchema },
        ]),
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule {}
