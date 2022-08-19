"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRoom(createRoomDto) {
        const room = await this.prisma.room.create({
            data: {
                name: createRoomDto.name,
                ownerId: createRoomDto.userId,
                visibility: createRoomDto.visibility,
                password: createRoomDto.password
            }
        });
        return room.id;
    }
    async addUserToRoom(userId, roomId) {
        const room = await this.prisma.room.update({
            where: { id: roomId },
            data: {
                users: {
                    connect: { id: userId }
                }
            }
        });
    }
    async addAdminToRoom(adminId, roomId) {
        const room = await this.prisma.room.update({
            where: { id: roomId },
            data: {
                admins: {
                    connect: { id: adminId }
                }
            }
        });
    }
    async addMuteToRoom(userId, roomId, date) {
        const mutedRoomtoUser = await this.prisma.mutedRoomtoUser.findFirst({
            where: {
                userId: userId,
                roomId: roomId
            }
        });
        if (mutedRoomtoUser) {
            await this.prisma.mutedRoomtoUser.update({
                where: {
                    id: mutedRoomtoUser.id
                },
                data: {
                    date: date
                }
            });
        }
        else {
            await this.prisma.mutedRoomtoUser.create({
                data: {
                    userId: userId,
                    roomId: roomId,
                    date: date
                }
            });
        }
    }
    async getMutedUsers(roomId) {
        const mutedUsers = await this.prisma.mutedRoomtoUser.findMany({
            where: { roomId: roomId },
            select: { userId: true, date: true }
        });
        return mutedUsers;
    }
    async removeUserFromRoom(userId, roomId) {
        const room = await this.prisma.room.update({
            where: { id: roomId },
            data: {
                users: {
                    disconnect: { id: userId }
                }
            },
            select: {
                users: true
            }
        });
    }
    async removeAdminFromRoom(adminId, roomId) {
        const room = await this.prisma.room.update({
            where: { id: roomId },
            data: {
                admins: {
                    disconnect: { id: adminId }
                }
            },
            select: {
                admins: true
            }
        });
    }
    async storeMessage(data) {
        let message = await this.prisma.message.create({
            data: {
                content: data.content,
                userId: data.user,
                roomId: data.room,
            }
        });
        return message;
    }
    async getRoomsForUser(id) {
        let user = await this.prisma.user.findUnique({
            where: { id: id },
            include: { rooms: true }
        });
        return user.rooms;
    }
    async getPublicRooms() {
        let rooms = await this.prisma.room.findMany({
            where: { visibility: "public" }
        });
        return rooms;
    }
    async getUsersInRoom(id) {
        let room = await this.prisma.room.findUnique({
            where: { id: id },
            include: { users: true }
        });
        return room.users;
    }
    async getAdminsInRoom(id) {
        let room = await this.prisma.room.findUnique({
            where: { id: id },
            include: { admins: true }
        });
        return room.admins;
    }
    async getAllUsers() {
        const users = await this.prisma.user.findMany({
            include: {
                stats: true,
                matchHistory: {
                    include: {
                        players: true,
                    }
                }
            },
        });
        return users;
    }
    async getAllMessagesForUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id: id },
            include: {
                rooms: {
                    include: { messages: true }
                }
            }
        });
        let messages = [];
        for (let i = 0; i < user.rooms.length; ++i) {
            messages.push(...user.rooms[i].messages);
        }
        return messages;
    }
    async getMessages(id) {
        let room = await this.prisma.room.findUnique({
            where: { id: id },
            include: { messages: true }
        });
        return room.messages;
    }
    async updatePassword(roomId, password) {
        const updatedRoom = await this.prisma.room.update({
            where: { id: roomId },
            data: {
                password: password,
            }
        });
        return updatedRoom.id;
    }
    async findAllIds(userId) {
        const { blockedIds } = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { blockedIds: true }
        });
        return (blockedIds);
    }
    async add(userId, blockedId) {
        const blockedIds = await this.findAllIds(userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                blockedIds: {
                    set: [...blockedIds, blockedId]
                }
            }
        });
    }
    async remove(userId, blockedId) {
        const blockedIds = await this.findAllIds(userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                blockedIds: {
                    set: blockedIds.filter((id) => id !== blockedId)
                }
            }
        });
    }
    async findAll(ids) {
        const blocked = await this.prisma.user.findMany({
            where: { id: { in: ids } }
        });
        return (blocked);
    }
    async getPassword(roomId) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { password: true }
        });
        return room.password;
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map