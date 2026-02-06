import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards, All } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConverseDto, CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from 'src/modules/auth/guards/abac.guard';
import { RequireAbacPolicy } from 'src/modules/auth/decorators/abac.decorator';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ConfigService } from '@nestjs/config';


@Controller('chat')
@UseGuards(AuthGuard('jwt'), AbacGuard)
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly configService: ConfigService
    ) { }

    @Post()
    @RequireAbacPolicy({ resource: 'chat', action: 'create' })
    create(@Body() createChatDto: CreateChatDto, @LoggedInUser() user: LoggedInUser) {
        return this.chatService.create(createChatDto, user);
    }

    @Get()
    @RequireAbacPolicy({ resource: 'chat', action: 'read' })
    findAll(@Req() req: Request) {
        return this.chatService.findAll(req);
    }

    @Get(':id')
    @RequireAbacPolicy({ resource: 'chat', action: 'read' })
    findOne(@Param('id') id: string) {
        return this.chatService.findOne(id);
    }

    @Patch(':id')
    @RequireAbacPolicy({ resource: 'chat', action: 'update' })
    update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
        return this.chatService.update(id, updateChatDto);
    }

    @Delete(':id')
    @RequireAbacPolicy({ resource: 'chat', action: 'delete' })
    remove(@Param('id') id: string) {
        return this.chatService.remove(id);
    }

    @Get(':id/conversation')
    @RequireAbacPolicy({ resource: 'conversation', action: 'read' })
    findConversations(@Param('id') chat_id: string, @Req() req: Request) {
        return this.chatService.findConversations(chat_id, req);
    }

    @Post(':id/conversation')
    @RequireAbacPolicy({ resource: 'conversation', action: 'create' })
    createConversation(@Param('id') id: string, @Body() body: ConverseDto, @Res() res: Response, @LoggedInUser() user: LoggedInUser) {
        return this.chatService.createConversation(res, id, body, user);
    }

    @All('llm-conversation')
    proxyToLLM(@Req() req: Request, @Res() res: Response) {
        const llmProxy = createProxyMiddleware({
            target: this.configService.get<string>('LLM_API_URL') + '/api/conversation',
            ignorePath: true,
            changeOrigin: true,
            cookieDomainRewrite: false,
            on: {
                proxyReq: (proxyReq, req: any) => {
                    if (!req.body || !Object.keys(req.body).length) return;
                    const bodyData = JSON.stringify(req.body);
                    proxyReq.setHeader('Content-Type', 'application/json');
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                },
            },
        });
        return llmProxy(req, res);
    }
}
