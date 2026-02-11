import { Logger, Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { ChatModule } from './modules/chat/chat.module';
import { RoleModule } from './modules/role/role.module';
import { PolicyModule } from './modules/policy/policy.module';
import { NotificationModule } from './modules/notification/notification.module';
import { KafkaModule } from './kafka/kafka.module';
import { CaslModule } from './casl/casl.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.development'
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
                dbName: configService.get<string>('MONGODB_DB_NAME'),
            }),
            inject: [ConfigService],
        }),
        // KafkaModule.registerAsync({
        //     useFactory: (configService: ConfigService) => ({
        //         clientId: configService.getOrThrow<string>('KAFKA_APP_ID'),
        //         brokers: [configService.getOrThrow<string>('KAFKA_BROKER_URL')],
        //     }),
        //     inject: [ConfigService],
        // }),
        AuthModule,
        RoleModule,
        PolicyModule,
        UserModule,
        // ProjectModule,
        ChatModule,
        NotificationModule,
        CaslModule,
    ],
    controllers: [],
    providers: [ConfigService, Logger],
})
export class AppModule {}
