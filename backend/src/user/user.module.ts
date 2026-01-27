import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
        NotificationModule,
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
