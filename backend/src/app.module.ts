import { Logger, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { ChatModule } from './chat/chat.module';
import { RoleModule } from './role/role.module';
import { PolicyModule } from './policy/policy.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RoleModule,
    PolicyModule,
    UserModule,
    ProjectModule,
    ChatModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    ConfigService,
    Logger
  ]
})
export class AppModule { }
