import { Inject, Injectable } from '@nestjs/common';
import { AddMemberDto, CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model, QueryFilter } from 'mongoose';
import { Request } from 'express';
import { Member, MemberDocument, ProjectRoleEnum } from './schemas/member.schema';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';
import { NotificationService } from 'src/modules/notification/notification.service';
import { KAFKA_CLIENT } from 'src/kafka/kafka.constants';
import { KAFKA_TOPICS } from 'src/kafka/kafka.topics';
import type { KafkaClient } from 'src/kafka/kafka.type';
import { Chat, ChatDocument } from '../chat/schemas/chat.schema';

@Injectable()
export class ProjectService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
        @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        @Inject(KAFKA_CLIENT) private readonly kafkaClient: KafkaClient,
        private readonly notificationService: NotificationService,
    ) {
        // this.kafkaClient.producer.send({
        //     topic: KAFKA_TOPICS.PARSER_CREATE.topic,
        //     messages: [
        //         {
        //             key: "6985a939ca03817fff102af5",
        //             value: JSON.stringify({
        //                 _id: '6985a939ca03817fff102af5',
        //                 name: "iiiijjjjkkkk",
        //                 description: "",
        //             }),
        //         },
        //     ],
        // });
    }

    async create(createProjectDto: CreateProjectDto, user: LoggedInUser) {
        const createdProject = await new this.projectModel({
            ...createProjectDto,
            created_by: user._id,
        }).save();

        this.notificationService.sendWithTemplate(user._id.toString(), 'PROJECT_CREATED', {
            userName: user.full_name,
            projectName: createProjectDto.title,
        });

        this.kafkaClient.producer.send({
            topic: KAFKA_TOPICS.PARSER_CREATE.topic,
            messages: [
                {
                    key: createdProject._id.toString(),
                    value: JSON.stringify({
                        _id: createdProject._id,
                        name: createProjectDto.title,
                        description: createProjectDto.description,
                    }),
                },
            ],
        });

        return createdProject;
    }

    addMember(project_id: string, body: AddMemberDto) {
        return this.memberModel.findOneAndUpdate(
            { project_id: project_id, user_id: body.user_id },
            {
                user_id: body.user_id,
                project_id: project_id,
                project_role: body.project_role as ProjectRoleEnum,
            },
            { new: true, upsert: true },
        );
    }

    removeMember(member_id: string) {
        return this.memberModel.findByIdAndDelete(member_id);
    }

    updateMemberPermission(member_id: string, body: AddMemberDto) {
        return this.memberModel.findByIdAndUpdate(
            member_id,
            {
                project_role: body.project_role as ProjectRoleEnum,
            },
            { new: true },
        );
    }

    async getMembers(project_id: string, req: Request) {
        const page_number = parseInt(req.query.page as string) || 1;
        const limit_number = parseInt(req.query.limit as string) || 100;
        const skip = (page_number - 1) * limit_number;
        const search = req.query.search as string;

        const filterQuery: QueryFilter<MemberDocument> = { project_id };
        if (search) {
            filterQuery.$or = [{ 'user_id.full_name': { $regex: search, $options: 'i' } }, { 'user_id.email': { $regex: search, $options: 'i' } }];
        }

        const total_docs_query = this.memberModel.countDocuments(filterQuery);
        const members_query = this.memberModel
            .find(filterQuery)
            .select('-__v')
            .skip(skip)
            .limit(limit_number)
            .sort({ createdAt: -1 })
            .populate('user_id', 'full_name email')
            .populate('project_id', 'title');

        const [members, total_docs] = await Promise.all([members_query.exec(), total_docs_query.exec()]);

        const total_pages = Math.ceil(total_docs / limit_number);

        return {
            data: members,
            page: page_number,
            limit: limit_number,
            total_pages,
            total_count: total_docs,
            message: 'Members fetched successfully',
        };
    }

    async findAll(req: Request) {
        const page_number = parseInt(req.query.page as string) || 1;
        const limit_number = parseInt(req.query.limit as string) || 100;
        const skip = (page_number - 1) * limit_number;
        const search = req.query.search as string;

        const filterQuery: QueryFilter<ProjectDocument> = { is_deleted: false };
        if (search) {
            filterQuery.$or = [{ title: { $regex: '^' + search, $options: 'i' } }, { description: { $regex: '^' + search, $options: 'i' } }];
        }

        const total_docs_query = this.projectModel.countDocuments(filterQuery);
        const projects_query = this.projectModel.find(filterQuery).select('-is_deleted -__v').skip(skip).limit(limit_number).sort({ createdAt: -1 }).populate('created_by', 'full_name email');

        const [projects, total_docs] = await Promise.all([projects_query.exec(), total_docs_query.exec()]);

        const total_pages = Math.ceil(total_docs / limit_number);

        return {
            data: projects,
            page: page_number,
            limit: limit_number,
            total_pages: total_pages,
            total_count: total_docs,
            message: 'Projects fetched successfully',
        };
    }

    findOne(id: string) {
        return this.projectModel.findById(id).populate('created_by', 'full_name email');
    }

    update(id: string, updateProjectDto: UpdateProjectDto) {
        return this.projectModel.findByIdAndUpdate(id, { ...updateProjectDto, updatedAt: new Date() }, { new: true });
    }

    remove(id: string) {
        this.memberModel.deleteMany({ project_id: id }).exec();
        this.chatModel.deleteMany({ project_id: id }).exec();
        return this.projectModel.findOneAndDelete({ _id: id });
    }
}
