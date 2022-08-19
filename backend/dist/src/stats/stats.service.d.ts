import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
export declare class StatsService {
    private readonly prisma;
    private readonly usersService;
    constructor(prisma: PrismaClient, usersService: UsersService);
    findLeaders(): Promise<import(".prisma/client").Stats[]>;
}
