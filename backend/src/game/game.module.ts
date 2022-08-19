import { Module } from '@nestjs/common';
import { GameGateway } from 'src/game/game.gateway';
import { GameService } from 'src/game/game.service';
import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Module({
	providers: [GameGateway, GameService, PrismaClient, UsersService],
})
export class GameModule {}
