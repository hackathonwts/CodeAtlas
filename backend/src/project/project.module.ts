import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Role, RoleSchema } from 'src/role/schemas/role.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Member, MemberSchema } from './schemas/member.schema';
import { NotificationSchema, Notification } from 'src/notification/schemas/notification.schema';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationTemplate, NotificationTemplateSchema } from 'src/notification/schemas/notification-template.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Project.name, schema: ProjectSchema },
            { name: Member.name, schema: MemberSchema },
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
        ]),
    ],
    controllers: [ProjectController],
    providers: [ProjectService, NotificationService],
})
export class ProjectModule {}
