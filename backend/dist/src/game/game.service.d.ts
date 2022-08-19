import { CreateMatchDto } from './dto/create-match.dto';
import { PrismaClient } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
export declare class GameService {
    private readonly prisma;
    private usersService;
    constructor(prisma: PrismaClient, usersService: UsersService);
    createMatch(m_data: CreateMatchDto): Promise<number>;
    incrementVictories(user_id: number, points_scored: number): Promise<void>;
    incrementLosses(user_id: number, points_scored: number): Promise<void>;
    getUsername(user_id: number): Promise<string>;
}
