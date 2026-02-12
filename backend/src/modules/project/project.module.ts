import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Member, MemberSchema } from './schemas/member.schema';
import { NotificationService } from 'src/modules/notification/notification.service';
import { ProjectDescription, ProjectDescriptionSchema } from './schemas/description.schema';
import { ProjectMarkdown, ProjectMarkdownSchema } from './schemas/markdown.schema';
import { ProjectStatus, ProjectStatusSchema } from './schemas/status.schema';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Project.name, schema: ProjectSchema },
            { name: ProjectStatus.name, schema: ProjectStatusSchema },
            { name: ProjectDescription.name, schema: ProjectDescriptionSchema },
            { name: ProjectMarkdown.name, schema: ProjectMarkdownSchema },
            { name: Member.name, schema: MemberSchema },
        ]),
        UserModule,
        RoleModule,
        NotificationModule,
    ],
    controllers: [ProjectController],
    providers: [ProjectService, NotificationService],
    exports: [MongooseModule],
})
export class ProjectModule { }
