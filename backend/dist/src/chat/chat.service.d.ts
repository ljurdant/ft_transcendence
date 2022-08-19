import { PrismaClient } from '@prisma/client';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    createRoom(createRoomDto: CreateRoomDto): Promise<number>;
    addUserToRoom(userId: number, roomId: number): Promise<void>;
    addAdminToRoom(adminId: number, roomId: number): Promise<void>;
    addMuteToRoom(userId: number, roomId: number, date: Date): Promise<void>;
    getMutedUsers(roomId: number): Promise<{
        date: Date;
        userId: number;
    }[]>;
    removeUserFromRoom(userId: number, roomId: number): Promise<void>;
    removeAdminFromRoom(adminId: number, roomId: number): Promise<void>;
    storeMessage(data: CreateMessageDto): Promise<import(".prisma/client").Message>;
    getRoomsForUser(id: number): Promise<import(".prisma/client").Room[]>;
    getPublicRooms(): Promise<import(".prisma/client").Room[]>;
    getUsersInRoom(id: number): Promise<import(".prisma/client").User[]>;
    getAdminsInRoom(id: number): Promise<import(".prisma/client").User[]>;
    getAllUsers(): Promise<any>;
    getAllMessagesForUser(id: number): Promise<any[]>;
    getMessages(id: number): Promise<import(".prisma/client").Message[]>;
    updatePassword(roomId: number, password: string): Promise<number>;
    findAllIds(userId: number): Promise<number[]>;
    add(userId: number, blockedId: number): Promise<void>;
    remove(userId: number, blockedId: number): Promise<void>;
    findAll(ids: number[]): Promise<import(".prisma/client").User[]>;
    getPassword(roomId: number): Promise<string>;
}
