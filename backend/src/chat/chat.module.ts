import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [ChatGateway, ChatService, PrismaClient]
})
export class ChatModule {}
