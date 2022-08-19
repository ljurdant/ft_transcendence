import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaClient } from '@prisma/client';
import { UsersGateway } from './users.gateway';
import { ChatService } from 'src/chat/chat.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaClient, UsersGateway, ChatService],
  exports: [UsersService],
})
export class UsersModule {}
