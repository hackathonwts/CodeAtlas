import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ApiExceptionFilter } from './common/exception.filter';
import { resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const logger = app.get(Logger);

    app.enableCors({
        origin: configService.get<string>('CORS_ORIGIN') || '*',
        credentials: true,
    });
    app.use(cookieParser());
    app.useStaticAssets(resolve('./public'));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }));
    app.useGlobalFilters(new ApiExceptionFilter());

    app.use((req: Request, res: Response, next: NextFunction) => {
        logger.verbose(`[${req.method}] ${req.originalUrl}`);
        next();
    });

    await app.listen(configService.getOrThrow<number>('PORT'), () => {
        logger.debug(`[BOOT] Base URL          : http://127.0.0.1:${configService.get('PORT')}`);
        logger.debug(`[BOOT] Node Version      : ${process.version}`);
        logger.debug(`[BOOT] Env (NODE_ENV)    : ${configService.get('NODE_ENV') || 'development'}`);
    });
}
bootstrap();
