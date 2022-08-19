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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const users_service_1 = require("../users/users.service");
let GameService = class GameService {
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async createMatch(m_data) {
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
    async incrementVictories(user_id, points_scored) {
        let user_stats = await this.prisma.stats.findUnique({
            where: { userId: user_id }
        });
        let current_xp = user_stats.xp + points_scored * 2;
        let current_level = +(0.2 * Math.sqrt(current_xp)).toFixed(2) + 1;
        await this.prisma.stats.update({
            where: { userId: user_id },
            data: {
                victories: { increment: 1 },
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
    async incrementLosses(user_id, points_scored) {
        let user_stats = await this.prisma.stats.findUnique({
            where: { userId: user_id }
        });
        let current_xp = user_stats.xp + points_scored;
        let current_level = +(0.2 * Math.sqrt(current_xp)).toFixed(2) + 1;
        const losses = await this.prisma.stats.update({
            where: { userId: user_id },
            data: {
                losses: { increment: 1 },
                xp: current_xp,
                level: current_level,
            }
        });
    }
    async getUsername(user_id) {
        let user = await this.prisma.user.findUnique({
            where: { id: user_id }
        });
        return user.username;
    }
};
GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient, users_service_1.UsersService])
], GameService);
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map