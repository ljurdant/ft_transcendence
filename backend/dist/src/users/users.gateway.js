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
exports.UsersGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const config_1 = require("@nestjs/config");
const friend_user_dto_1 = require("./dto/friend-user.dto");
const socket_io_1 = require("socket.io");
const users_service_1 = require("./users.service");
const chat_service_1 = require("../chat/chat.service");
const invite_dto_1 = require("./dto/invite.dto");
let UsersGateway = class UsersGateway {
    constructor(usersService, chatService) {
        this.usersService = usersService;
        this.chatService = chatService;
    }
    async add(client, friendUserDto) {
        await this.usersService.addFriend(friendUserDto.userId, friendUserDto.friendId);
        const friendsIds = await this.usersService.findFriendsIds(friendUserDto.userId);
        const friends = await this.usersService.findFriends(friendsIds);
        client.emit('get friends', friends);
    }
    async remove(client, friendUserDto) {
        await this.usersService.removeFriend(friendUserDto.userId, friendUserDto.friendId);
        const friendsIds = await this.usersService.findFriendsIds(friendUserDto.userId);
        const friends = await this.usersService.findFriends(friendsIds);
        client.emit('get friends', friends);
    }
    async findAll(client, userId) {
        const friendsIds = await this.usersService.findFriendsIds(userId);
        const friends = await this.usersService.findFriends(friendsIds);
        client.emit('get friends', friends);
    }
    async handleNewUser(client, userId) {
        await this.chatService.addUserToRoom(userId, 1);
        const allUsers = await this.usersService.getAllUsers();
        this.server.emit('new user', allUsers);
        client.data.userId = userId;
        this.server.emit('new connection', userId);
        const socks = await this.server.fetchSockets();
        const online = socks.map((c) => c.data.userId);
        const inGame = socks.filter((c) => c.data.inGame === true).map((c) => c.data.userId);
        client.emit('status map', { online: online, inGame: inGame });
    }
    async handleNewConnection(client, userId) {
        const allUsers = await this.usersService.getAllUsers();
        this.server.emit('new user', allUsers);
        client.data.userId = userId;
        this.server.emit('new connection', userId);
        const socks = await this.server.fetchSockets();
        const online = socks.map((c) => c.data.userId);
        const inGame = socks.filter((c) => c.data.inGame === true).map((c) => c.data.userId);
        client.emit('status map', { online: online, inGame: inGame });
    }
    countdown_start(client, userId) {
        client.data.inGame = true;
        this.server.emit('new gamer', userId);
    }
    handleRemoveGamer(client, userId) {
        client.data.inGame = false;
    }
    async inviteForGame(client, inviteDto) {
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets) {
            if (socket.data.userId === inviteDto.otherUserId) {
                const user = await this.usersService.findOne(inviteDto.userId);
                this.server
                    .to(socket.id)
                    .emit('invite for game', {
                    userId: inviteDto.userId,
                    inviterId: client.id,
                    inviterUsername: user.username,
                    inviteeId: socket.id,
                });
            }
        }
    }
    handleConnection(client) {
    }
    handleDisconnect(client) {
        this.server.emit('new disconnection', client.data.userId);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], UsersGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('add friend'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        friend_user_dto_1.FriendUserDto]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "add", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove friend'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        friend_user_dto_1.FriendUserDto]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "remove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get friends'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "findAll", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('new user'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "handleNewUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('new connection'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "handleNewConnection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('countdown_start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", void 0)
], UsersGateway.prototype, "countdown_start", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove gamer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", void 0)
], UsersGateway.prototype, "handleRemoveGamer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite for game'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        invite_dto_1.InviteDto]),
    __metadata("design:returntype", Promise)
], UsersGateway.prototype, "inviteForGame", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], UsersGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], UsersGateway.prototype, "handleDisconnect", null);
UsersGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: new config_1.ConfigService().get('FRONT_URL'),
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        chat_service_1.ChatService])
], UsersGateway);
exports.UsersGateway = UsersGateway;
//# sourceMappingURL=users.gateway.js.map