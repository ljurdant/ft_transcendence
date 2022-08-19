import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';

import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaClient, private usersService: UsersService) {}

    async createMatch(m_data: CreateMatchDto) {
        const match = await this.prisma.match.create({
            data: {
                players: {
                    connect: [
                        { id: m_data.winnerId },
                        { id: m_data.loserId }
                    ]
                },
                ladder: m_data.ladder,
                winnerId: m_data.winnerId,
                score: m_data.score
            }
        });
        return match.id;
    }

    async incrementVictories(user_id : number, points_scored : number) {
        let user_stats = await this.prisma.stats.findUnique({
            where: {userId: user_id}
        })
        let current_xp : number = user_stats.xp + points_scored * 2;
        let current_level : number = +(0.2 * Math.sqrt(current_xp)).toFixed(2) + 1;
        await this.prisma.stats.update({
            where: {userId: user_id},
            data: {
                victories: {increment: 1},
                xp: current_xp,
                level: current_level
            }
        });
        if (user_stats.victories == 0) {
            await this.usersService.addAchievement(user_id, 0);
        }
        else if (user_stats.victories == 2) {
            await this.usersService.addAchievement(user_id, 1);
        }

    }

    async incrementLosses(user_id : number, points_scored : number) {
        let user_stats = await this.prisma.stats.findUnique({
            where: {userId: user_id}
        })
        let current_xp : number = user_stats.xp + points_scored;
        let current_level : number = +(0.2 * Math.sqrt(current_xp)).toFixed(2) + 1;
        const losses = await this.prisma.stats.update({
            where: {userId: user_id},
            data: {
                losses: {increment: 1},
                xp: current_xp,
                level: current_level,
            }
        });
    }

    async getUsername(user_id : number) {
        let user = await this.prisma.user.findUnique({
            where: {id: user_id}
        })
        return user.username;
    }

}
