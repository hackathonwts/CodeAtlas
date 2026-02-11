import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserStatus } from 'src/modules/user/schemas/user.schema';
import { JwtPayloadType } from 'src/common/jwt.type';
import { ADMIN_AUTH_TOKEN_NAME } from 'src/common/constants';
import { UserRepository } from '../user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly userRepository: UserRepository,
        readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.[ADMIN_AUTH_TOKEN_NAME] ?? null]),
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(_req: Request, payload: JwtPayloadType, done: VerifiedCallback) {
        const { id, iat } = payload;
        const user = await this.userRepository.getAuthUser({ _id: id, status: UserStatus.Active });
        if (!user) return done(new UnauthorizedException(), false);
        return done(null, user, iat);
    }
}
