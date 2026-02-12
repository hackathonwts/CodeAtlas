import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { RoleModule } from '../role/role.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => RoleModule),
        NotificationModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [MongooseModule],
})
export class UserModule { }
