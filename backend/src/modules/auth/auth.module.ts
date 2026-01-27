import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'src/modules/user/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtStrategy } from './guards/jwt.strategy';
import { Role, RoleSchema } from 'src/modules/role/schemas/role.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
