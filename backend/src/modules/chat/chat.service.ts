import { Injectable } from '@nestjs/common';
import { ConverseDto, CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { Response } from 'express';
import { OpenAI } from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Model, QueryFilter } from 'mongoose';
import { Request } from 'express';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';

@Injectable()
export class ChatService {
    private client: OpenAI;
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    ) {
        this.client = new OpenAI({
            baseURL: 'http://127.0.0.1:4444/v1',
            apiKey: '',
        });
    }

    create(createChatDto: CreateChatDto, loggedInUser: LoggedInUser) {
        const createdChat = new this.chatModel({
            ...createChatDto,
            user_id: loggedInUser._id,
        });
        return createdChat.save();
    }

    async findAll(req: Request) {
        const page_number = parseInt(req.query.page as string) || 1;
        const limit_number = parseInt(req.query.limit as string) || 100;
        const skip = (page_number - 1) * limit_number;
        const search = req.query.search as string;

        const filterQuery: QueryFilter<ChatDocument> = {};
        if (search) {
            filterQuery.$or = [{ title: { $regex: search, $options: 'i' } }];
        }

        const total_docs_query = this.chatModel.countDocuments(filterQuery);
        const chats_query = this.chatModel
            .find(filterQuery)
            .select('-__v')
            .skip(skip)
            .limit(limit_number)
            .sort({ createdAt: -1 })
            .populate('project_id', 'title')
            .populate('user_id', 'full_name email');

        const [chats, total_docs] = await Promise.all([chats_query.exec(), total_docs_query.exec()]);

        const total_pages = Math.ceil(total_docs / limit_number);

        return {
            data: chats,
            page: page_number,
            limit: limit_number,
            total_pages,
            total_count: total_docs,
            message: 'Chats fetched successfully',
        };
    }

    findOne(id: string) {
        return this.chatModel.findById(id).populate('project_id', 'title').populate('user_id', 'full_name email');
    }

    update(id: string, updateChatDto: UpdateChatDto) {
        return this.chatModel
            .findByIdAndUpdate(id, { ...updateChatDto, updatedAt: new Date() }, { new: true })
            .populate('project_id', 'title')
            .populate('user_id', 'full_name email');
    }

    remove(id: string) {
        this.conversationModel.deleteMany({ chat_id: id }).exec();
        return this.chatModel.findByIdAndDelete(id);
    }

    async findConversations(chat_id: string, req: Request) {
        const page_number = parseInt(req.query.page as string) || 1;
        const limit_number = parseInt(req.query.limit as string) || 50;
        const skip = (page_number - 1) * limit_number;
        const search = req.query.search as string;

        const filterQuery: QueryFilter<ConversationDocument> = { chat_id };
        if (search) {
            filterQuery.$or = [{ message: { $regex: search, $options: 'i' } }];
        }

        const total_docs_query = this.conversationModel.countDocuments(filterQuery);
        const conversations_query = this.conversationModel.find(filterQuery).select('-__v').skip(skip).limit(limit_number).sort({ createdAt: 1 }).populate('user_id', 'full_name email');

        const [conversations, total_docs] = await Promise.all([conversations_query.exec(), total_docs_query.exec()]);

        const total_pages = Math.ceil(total_docs / limit_number);

        return {
            data: conversations,
            page: page_number,
            limit: limit_number,
            total_pages,
            total_count: total_docs,
            message: 'Conversations fetched successfully',
        };
    }

    async createConversation(res: Response, _id: string, body: ConverseDto, user: LoggedInUser) {
        try {
            await this.conversationModel.create({
                chat_id: _id,
                user_id: user._id,
                content: body.prompt,
                type: 'text',
                role: 'user',
            });

            const stream = await this.client.chat.completions.create({
                model: 'qwen3-4b-instruct-2507-mlx',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful coding assistant. Keep responses clear and easy to read, well-formatted and use markdown.`,
                    },
                    { role: 'user', content: body.prompt },
                ],
                stream: true,
            });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            let full_response = '';
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    full_response += content;
                    res.write(`data: ${content}\n\n`);
                }
            }

            await this.conversationModel.create({
                chat_id: _id,
                user_id: user._id,
                content: full_response,
                type: 'text',
                role: 'assistant',
            });

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
