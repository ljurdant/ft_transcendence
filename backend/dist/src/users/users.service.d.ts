import { PrismaClient, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './interfaces/profile.interface';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findOrCreateUser(id: number): Promise<User>;
    findOne(id: number): Promise<User>;
    createUser(id: number): Promise<User>;
    generateRandomAvailableUsername(): Promise<string>;
    getUserWithStatsAndMatchHistory(id: number): Promise<any>;
    getProfile(id: number): Promise<Profile>;
    updateUser(id: number, data: UpdateUserDto): Promise<string>;
    tryToChangeUsername(id: number, newUsername: string): Promise<string>;
    tryToChangeAuthentication(id: number, tfa: boolean): Promise<string>;
    findFriendsIds(userId: number): Promise<number[]>;
    findFriends(ids: number[]): Promise<User[]>;
    addFriend(userId: number, friendId: number): Promise<void>;
    removeFriend(userId: number, friendId: number): Promise<void>;
    addAchievement(userId: number, achievementId: number): Promise<void>;
    getAllUsers(): Promise<any[]>;
    getUsername(id: number): Promise<string>;
    getMock(): Promise<User>;
}
