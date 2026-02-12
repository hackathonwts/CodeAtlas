import { forwardRef, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/modules/role/schemas/role.schema';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
        ]),
        forwardRef(() => UserModule)
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [MongooseModule],
})
export class RoleModule { }
