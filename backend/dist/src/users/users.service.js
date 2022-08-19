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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const fs = require("fs/promises");
const otplib_1 = require("otplib");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOrCreateUser(id) {
        let user = await this.findOne(id);
        if (!user) {
            user = await this.createUser(id);
        }
        return user;
    }
    async findOne(id) {
        return this.prisma.user.findUnique({
            where: { id: id },
        });
    }
    async createUser(id) {
        const username = await this.generateRandomAvailableUsername();
        const user = await this.prisma.user.create({
            data: {
                id: id,
                username: username,
                stats: {
                    create: {},
                },
            },
        });
        await fs.copyFile('/backend/public/avatars/default.png', '/backend/public/avatars/' + id + '.png');
        await this.prisma.room.update({
            where: { id: 1 },
            data: {
                users: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
        return user;
    }
    async generateRandomAvailableUsername() {
        let randomNumber;
        let username;
        let isNotAvailable;
        do {
            randomNumber = Math.floor(Math.random() * (100000 - 16) + 16);
            username = randomNumber.toString(16);
            isNotAvailable = await this.prisma.user.findUnique({
                where: {
                    username: username,
                },
            });
        } while (isNotAvailable);
        return username;
    }
    async getUserWithStatsAndMatchHistory(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            include: {
                stats: true,
                matchHistory: {
                    include: {
                        players: true,
                    },
                },
            },
        });
        return user;
    }
    async getProfile(id) {
        const user = await this.getUserWithStatsAndMatchHistory(id);
        if (!user) {
            throw new common_1.NotFoundException();
        }
        const profile = {
            id: user.id,
            username: user.username,
            firstLogin: user.firstLogin,
            tfa: user.tfa,
            victories: user.stats.victories,
            losses: user.stats.losses,
            level: user.stats.level,
            matchHistory: user.matchHistory,
            achievements: user.achievements,
        };
        return profile;
    }
    async updateUser(id, data) {
        if (Object.keys(data).length != 1) {
            throw new common_1.BadRequestException();
        }
        if (data.hasOwnProperty('username')) {
            return this.tryToChangeUsername(id, data.username);
        }
        if (data.hasOwnProperty('tfa')) {
            return this.tryToChangeAuthentication(id, data.tfa);
        }
    }
    async tryToChangeUsername(id, newUsername) {
        try {
            const user = await this.prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    username: newUsername,
                    firstLogin: false,
                },
            });
            return user.username;
        }
        catch {
            throw new common_1.ConflictException();
        }
    }
    async tryToChangeAuthentication(id, tfa) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (user.tfa === tfa) {
            throw new common_1.ConflictException();
        }
        const secret = tfa === true ? otplib_1.authenticator.generateSecret() : '';
        await this.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                tfa: tfa,
                otpSecret: secret,
            },
        });
        return secret;
    }
    async findFriendsIds(userId) {
        const { friendIds } = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { friendIds: true },
        });
        return friendIds;
    }
    async findFriends(ids) {
        const friends = await this.prisma.user.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
        return friends;
    }
    async addFriend(userId, friendId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                friendIds: {
                    push: friendId,
                },
            },
        });
    }
    async removeFriend(userId, friendId) {
        const friendIds = await this.findFriendsIds(userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                friendIds: {
                    set: friendIds.filter((id) => id !== friendId),
                },
            },
        });
    }
    async addAchievement(userId, achievementId) {
        const user = await this.findOne(userId);
        if (user.achievements.includes(achievementId) === false) {
            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    achievements: {
                        push: achievementId,
                    },
                },
            });
        }
    }
    async getAllUsers() {
        const users = await this.prisma.user.findMany();
        let list = [];
        for (const user of users) {
            list.push({ id: user.id, username: user.username });
        }
        return list;
    }
    async getUsername(id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        return user.username;
    }
    async getMock() {
        const user = await this.prisma.user.findUnique({
            where: {
                id: 1,
            },
        });
        return user;
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map