import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly usersService: UsersService,
  ) {}

  async findLeaders() {
    const stats = await this.prisma.stats.findMany({
      orderBy: {
        victories: 'desc',
      },
    });
	for (const user of stats) {
		user['username'] = await this.usersService.getUsername(user.userId);
	}
    return stats;
  }
}
