import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService, PrismaClient, UsersService],
  exports: [StatsService]
})
export class StatsModule {}