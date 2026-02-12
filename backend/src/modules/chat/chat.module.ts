import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { CaslModule } from 'src/casl/casl.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: Conversation.name, schema: ConversationSchema },
        ]),
        CaslModule,
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [MongooseModule],
})
export class ChatModule {}
