import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	console.log(join(__dirname, '..', 'public'))
	app.useStaticAssets(join(__dirname, '..', '..', 'public'));
	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true
	}));
	app.enableCors({
		origin: (new ConfigService).get("FRONT_URL"),
		credentials: true
	});
	await app.listen(3001);
}

bootstrap();