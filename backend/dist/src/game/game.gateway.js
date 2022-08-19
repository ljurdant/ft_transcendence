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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const Game_1 = require("./classes/Game");
const consts = require("./classes/Consts");
const utils = require("./utils");
const game_service_1 = require("./game.service");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
function existingEmptyGame(games, username) {
    var ref = games;
    for (const game of ref) {
        if (game.spaceAvailable(username) && game.publicity === "public")
            return game;
    }
    return null;
}
function userInGame(games, username) {
    var ref = games;
    for (const game of ref) {
        for (const player of game.players)
            if (player.real_name === username)
                return true;
    }
    return false;
}
async function startGameFullRooms(games, server) {
    for (const game of games) {
        if (game.players.length === 2 && game.state === "waiting-player") {
            game.state = "waiting-readiness";
            server.to(game.room_id).emit("waiting-readiness", game.players[0].id, game.players[1].id, game.players[0].real_name, game.players[1].real_name, game.players[0].real_id, game.players[1].real_id);
        }
    }
}
let GameGateway = class GameGateway {
    constructor(game_service, usersService) {
        this.game_service = game_service;
        this.usersService = usersService;
        this.clients = [];
        this.users = [];
        this.games = [];
        this.timestep = 15;
    }
    async handleDisconnect(client) {
        let index = -1;
        if ((index = this.clients.indexOf(client.id)) !== -1) {
            this.users.splice(index, 1);
            this.clients.splice(index, 1);
            for (let game of this.games) {
                for (const player of game.players) {
                    if (player.id === client.id) {
                        this.server.to(game.room_id).emit("player-disconnect", player.index);
                        if (game.update_interval)
                            clearInterval(game.update_interval);
                        if (game.countdown_timeout)
                            clearTimeout(game.countdown_timeout);
                        if (game.players.length === 2 && game.state === "in-game") {
                            if (game.players.indexOf(player) === 0) {
                                this.game_service.incrementVictories(game.players[1].real_id, game.score[1]);
                                this.game_service.createMatch({ ladder: 0, winnerId: game.players[1].real_id, loserId: game.players[0].real_id, score: game.score });
                            }
                            else {
                                this.game_service.incrementVictories(game.players[0].real_id, game.score[0]);
                                this.game_service.createMatch({ ladder: 0, winnerId: game.players[0].real_id, loserId: game.players[1].real_id, score: game.score });
                            }
                            this.game_service.incrementLosses(player.real_id, game.score[game.players.indexOf(player)]);
                        }
                        this.server.emit("new disconnection", game.players[game.players.indexOf(player)].real_id);
                        if (game.players.length > 1)
                            this.server.emit("quit-game", game.players[(game.players.indexOf(player) + 1) % 2].real_id);
                        client.leave(game.room_id);
                        this.games.splice(this.games.indexOf(game), 1);
                        return;
                    }
                }
                game.state = "game-over";
                for (let spectator of game.spectators) {
                    if (spectator === client.id) {
                        game.spectators.splice(game.spectators.indexOf(spectator), 1);
                        client.leave(game.room_id);
                        return;
                    }
                }
            }
        }
    }
    async handleQuitOngoing(client, returnMenu) {
        let index = this.clients.indexOf(client.id);
        if (index === -1)
            return;
        if (!returnMenu) {
            this.users.splice(index, 1);
            this.clients.splice(index, 1);
        }
        for (let game of this.games) {
            for (let player of game.players) {
                if (player.id === client.id) {
                    this.server.to(game.room_id).emit("player-disconnect", player.index);
                    if (game.update_interval)
                        clearInterval(game.update_interval);
                    if (game.countdown_timeout)
                        clearTimeout(game.countdown_timeout);
                    if (game.players.length === 2 && game.state === "in-game") {
                        if (game.players.indexOf(player) === 0) {
                            this.game_service.incrementVictories(game.players[1].real_id, game.score[1]);
                            this.game_service.createMatch({ ladder: 0, winnerId: game.players[1].real_id, loserId: game.players[0].real_id, score: game.score });
                        }
                        else {
                            this.game_service.incrementVictories(game.players[0].real_id, game.score[0]);
                            this.game_service.createMatch({ ladder: 0, winnerId: game.players[0].real_id, loserId: game.players[1].real_id, score: game.score });
                        }
                        this.game_service.incrementLosses(player.real_id, game.score[game.players.indexOf(player)]);
                        this.usersService.addAchievement(player.real_id, 2);
                    }
                    game.state = "game-over";
                    this.server.emit("quit-game", game.players[0].real_id);
                    if (game.players.length > 1)
                        this.server.emit("quit-game", game.players[1].real_id);
                    client.leave(game.room_id);
                    this.games.splice(this.games.indexOf(game), 1);
                    return;
                }
            }
            for (let spectator of game.spectators) {
                if (spectator === client.id) {
                    game.spectators.splice(game.spectators.indexOf(spectator), 1);
                    client.leave(game.room_id);
                    return;
                }
            }
        }
    }
    async handleQuitOwn(client) {
        for (let game of this.games) {
            for (let player of game.players) {
                if (player.id === client.id) {
                    if (game.update_interval)
                        clearInterval(game.update_interval);
                    if (game.countdown_timeout)
                        clearTimeout(game.countdown_timeout);
                    client.leave(game.room_id);
                    if (this.games.indexOf(game) != -1)
                        this.games.splice(this.games.indexOf(game), 1);
                    return;
                }
            }
        }
    }
    async getConnection(data) {
        this.clients.push(data.s_id);
        this.users.push([data.u_id, data.u_name, false]);
    }
    async handleFinishedLoading(client) {
        this.users[this.clients.indexOf(client.id)][2] = true;
    }
    async handleSocketResponseInvitation(client, data) {
        for (let game of this.games) {
            if (game.room_id === data.r_id && game.polling === false) {
                game.polling = true;
                client.join(game.room_id);
                game.addPlayer(client.id, [data.id.toString(), data.name, false]);
                let inte = setInterval(() => {
                    if (this.clients.indexOf(client.id) != -1 && this.clients.indexOf(data.other_id) != -1 && this.users[this.clients.indexOf(client.id)][2] === true && this.users[this.clients.indexOf(data.other_id)][2] === true) {
                        this.server.to(game.room_id).emit("waiting-player", game.room_id, game.score_limit, game.map.name);
                        game.state = "waiting-readiness";
                        this.server.to(game.room_id).emit("waiting-readiness", game.players[0].id, game.players[1].id, game.players[0].real_name, game.players[1].real_name, game.players[0].real_id, game.players[1].real_id);
                        game.polling = false;
                        clearInterval(inte);
                    }
                }, 500);
                setTimeout(() => {
                    if (inte) {
                        game.polling = false;
                        clearInterval(inte);
                    }
                }, 10000);
            }
        }
    }
    async handleSpectateGame(client, name) {
        for (let game of this.games) {
            for (let player of game.players) {
                if (player.real_name === name) {
                    client.join(game.room_id);
                    let inte = setInterval(() => {
                        if (this.clients.indexOf(client.id) != -1 && this.users[this.clients.indexOf(client.id)][2] === true) {
                            this.server.to(client.id).emit("spectate", game.room_id, game.score_limit, game.map.name, game.state, game.players[0].id, (game.players.length > 1 ? game.players[1].id : "null"), game.players[0].real_name, (game.players.length > 1 ? game.players[1].real_name : "null"), game.players[0].real_id, (game.players.length > 1 ? game.players[1].real_id : 0));
                            clearInterval(inte);
                        }
                    }, 500);
                    setTimeout(() => {
                        if (inte) {
                            game.polling = false;
                            clearInterval(inte);
                        }
                    }, 10000);
                }
            }
        }
    }
    async handleInviteCreationGame(client, data) {
        let user1 = await this.game_service.getUsername(data[0].userId);
        let user2 = await this.game_service.getUsername(data[1]);
        for (let game of this.games) {
            for (let player of game.players) {
                if (player.real_name === user1 || player.real_name === user2)
                    return;
            }
        }
        this.server.to(data[0].inviterId).emit("accepted game");
        let game = new Game_1.Game(utils.randomRoomId());
        this.games.push(game);
        client.join(game.room_id);
        game.addPlayer(client.id, [data[1].toString(), user2, false]);
        this.server.emit("please send back", { id: data[0].userId, other_id: client.id, name: user1, r_id: game.room_id });
    }
    async handleMatchmaking(client, data) {
        if (this.clients.indexOf(client.id) === -1)
            return;
        if (userInGame(this.games, this.users[this.clients.indexOf(client.id)][1]))
            return;
        let existing_game = null;
        if (data[0] === "public" && data[1])
            existing_game = existingEmptyGame(this.games, this.users[this.clients.indexOf(client.id)][1]);
        if (existing_game === null) {
            existing_game = new Game_1.Game(utils.randomRoomId());
            this.games.push(existing_game);
        }
        existing_game.publicity = data[0];
        if (existing_game.score_limit === 0)
            existing_game.score_limit = data[2];
        if (data[3] === "city")
            existing_game.map = consts.city_map;
        else if (data[3] === "casino")
            existing_game.map = consts.casino_map;
        client.join(existing_game.room_id);
        existing_game.addPlayer(client.id, this.users[this.clients.indexOf(client.id)]);
        this.server.to(existing_game.room_id).emit("waiting-player", existing_game.room_id, existing_game.score_limit, existing_game.map.name);
        startGameFullRooms(this.games, this.server);
    }
    async handleJoinGame(client, data) {
        let found = false;
        for (let game of this.games) {
            if (game.room_id === data[0]) {
                found = true;
                if (data[1] === true) {
                    client.join(game.room_id);
                    game.addSpectator(client.id);
                    this.server.to(client.id).emit("spectate", game.room_id, game.score_limit, game.map.name, game.state, game.players[0].id, (game.players.length > 1 ? game.players[1].id : "null"), game.players[0].real_name, (game.players.length > 1 ? game.players[1].real_name : "null"), game.players[0].real_id, (game.players.length > 1 ? game.players[1].real_id : 0));
                }
                else if (game.players.length < 2 && game.spaceAvailable(this.users[this.clients.indexOf(client.id)][1])) {
                    client.join(game.room_id);
                    game.addPlayer(client.id, this.users[this.clients.indexOf(client.id)]);
                    this.server.to(game.room_id).emit("waiting-player", game.room_id, game.score_limit, game.map.name);
                    game.state = "waiting-readiness";
                    this.server.to(game.room_id).emit("waiting-readiness", game.players[0].id, game.players[1].id, game.players[0].real_name, game.players[1].real_name, game.players[0].real_id, game.players[1].real_id);
                }
                else if (game.players.length < 2)
                    this.server.to(client.id).emit("matchmaking-error", "already_in_game");
                else
                    this.server.to(client.id).emit("matchmaking-error", "game_full");
            }
        }
        if (!found)
            this.server.to(client.id).emit("matchmaking-error", "game_not_found");
    }
    async startCountDown(game) {
        game.state = "in-game";
        let test = this.server;
        test.to(game.room_id).emit("updated_pos", game.pong.pos, game.pong.velocity, [game.players[0].id, game.players[0].pos], [game.players[1].id, game.players[1].pos], game.score, game.pong.value);
        for (let i = 1; i < 5; i++)
            game.countdown_timeout = setTimeout(() => {
                if (game.state !== "game-over")
                    test.to(game.room_id).emit("countdown-server");
                if (i === 4) {
                    let calculate_state = "none";
                    game.update_interval = setInterval(() => {
                        if (calculate_state === "none")
                            calculate_state = game.pong.calculateNewPos(game, this.server);
                        if (game.over()) {
                            test.to(game.room_id).emit("game-over");
                            clearInterval(game.update_interval);
                            var w_id, l_id;
                            if (game.score[0] > game.score[1]) {
                                w_id = game.players[0].real_id;
                                l_id = game.players[1].real_id;
                            }
                            else {
                                w_id = game.players[1].real_id;
                                l_id = game.players[0].real_id;
                            }
                            this.game_service.incrementVictories(w_id, game.score[0] > game.score[1] ? game.score[0] : game.score[1]);
                            this.game_service.incrementLosses(l_id, game.score[0] < game.score[1] ? game.score[0] : game.score[1]);
                            this.game_service.createMatch({ ladder: 0, winnerId: w_id, loserId: l_id, score: game.score });
                            this.server.emit("quit-game", game.players[0].real_id);
                            this.server.emit("quit-game", game.players[1].real_id);
                            this.games.splice(this.games.indexOf(game), 1);
                            return;
                        }
                        else if (calculate_state === "relaunch") {
                            game.pong.velocity = [0, 0];
                            game.pong.pos = [consts.MAP_WIDTH / 2 - consts.PONG_DIAMETER / 2, consts.MAP_HEIGHT / 2 - consts.PONG_DIAMETER / 2];
                            calculate_state = "null";
                            game.increment_score();
                            if (!game.over()) {
                                setTimeout(() => {
                                    game.scorePoint();
                                    if (game.state !== "game-over")
                                        test.to(game.room_id).emit("relaunch");
                                    for (var j = 1; j < 3; j++) {
                                        setTimeout((index) => {
                                            if (game.state !== "game-over")
                                                test.to(game.room_id).emit("countdown-server");
                                            if (index === 2) {
                                                calculate_state = "none";
                                            }
                                        }, j * 1000, j);
                                    }
                                }, 500);
                            }
                        }
                        test.to(game.room_id).emit("updated_pos", game.pong.pos, game.pong.velocity, [game.players[0].id, game.players[0].pos], [game.players[1].id, game.players[1].pos], game.score, game.pong.value);
                    }, this.timestep);
                }
            }, i * 1000);
    }
    async handleCountdown(client) {
        for (let game of this.games) {
            for (const player of game.players) {
                if (player.id === client.id && game.state === "waiting-readiness") {
                    if (game.players[0].ready && game.players[1].ready) {
                        this.startCountDown(game);
                        return;
                    }
                }
            }
        }
    }
    async handleSwitchReadiness(client_id) {
        for (const game of this.games) {
            for (const player of game.players) {
                if (player.id === client_id && game.players.length === 2) {
                    player.ready = !player.ready;
                    this.server.to(game.room_id).emit("switch_readiness-server", game.players[0].ready, game.players[1].ready, client_id);
                    return;
                }
            }
        }
    }
    async handleMoveUp(client_id) {
        for (const game of this.games) {
            if (game.players.length === 2 && game.state === "in-game") {
                for (const player of game.players) {
                    if (player.id === client_id) {
                        player.moveUp();
                        return;
                    }
                }
            }
        }
    }
    async handleMoveDown(client_id) {
        for (const game of this.games) {
            if (game.players.length === 2 && game.state === "in-game") {
                for (const player of game.players) {
                    if (player.id === client_id) {
                        player.moveDown();
                        return;
                    }
                }
            }
        }
    }
    async handleMoveNull(client_id) {
        for (const game of this.games) {
            if (game.players.length === 2 && game.state === "in-game") {
                for (const player of game.players) {
                    if (player.id === client_id) {
                        player.velocity[1] = 0;
                        return;
                    }
                }
            }
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("quit-ongoing-game"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Boolean]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleQuitOngoing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("quit-own-game"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleQuitOwn", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('my_id'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "getConnection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("finished loading"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleFinishedLoading", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('socket response'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleSocketResponseInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("spectate game"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleSpectateGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('accepted game'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleInviteCreationGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('matchmaking'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleMatchmaking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('find_game'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleJoinGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("countdown_start"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleCountdown", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("switch_readiness"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleSwitchReadiness", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("move_up"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleMoveUp", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("move_down"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleMoveDown", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("move_null"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleMoveNull", null);
GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: (new config_1.ConfigService).get("FRONT_URL"),
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [game_service_1.GameService, users_service_1.UsersService])
], GameGateway);
exports.GameGateway = GameGateway;
//# sourceMappingURL=game.gateway.js.map