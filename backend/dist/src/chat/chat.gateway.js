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
exports.ChatGateway = void 0;
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const user_room_dto_1 = require("./dto/user-room.dto");
const create_room_dto_1 = require("./dto/create-room.dto");
const create_message_dto_1 = require("./dto/create-message.dto");
const create_dm_room_dto_1 = require("./dto/create-dm-room.dto");
const update_password_dto_1 = require("./dto/update-password.dto");
const blocked_user_dto_1 = require("./dto/blocked-user.dto");
const check_password_dto_1 = require("./dto/check-password.dto");
const add_mute_dto_1 = require("./dto/add-mute.dto");
const bcrypt = require("bcrypt");
const common_1 = require("@nestjs/common");
const validation_filter_1 = require("./filters/validation.filter");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async handleCreateRoom(client, createRoomDto) {
        let roomId;
        const handler = async (err, hashed) => {
            if (err) {
            }
            else {
                roomId = await this.chatService.createRoom({ name: createRoomDto.name, userId: createRoomDto.userId, visibility: createRoomDto.visibility, password: hashed });
                await this.chatService.addUserToRoom(createRoomDto.userId, roomId);
                await this.chatService.addAdminToRoom(createRoomDto.userId, roomId);
                client.emit('create room');
            }
        };
        if (createRoomDto.password !== "") {
            bcrypt.hash(createRoomDto.password, 10, handler);
        }
        else {
            let roomId = await this.chatService.createRoom({ name: createRoomDto.name, userId: createRoomDto.userId, visibility: createRoomDto.visibility, password: '' });
            await this.chatService.addUserToRoom(createRoomDto.userId, roomId);
            await this.chatService.addAdminToRoom(createRoomDto.userId, roomId);
            client.emit('create room');
        }
    }
    async handleCreateDMRoom(client, createDMRoomDto) {
        const createRoomDto = { name: createDMRoomDto.name, userId: 0, visibility: "private", password: '' };
        let roomId = await this.chatService.createRoom(createRoomDto);
        await this.chatService.addUserToRoom(createDMRoomDto.user1Id, roomId);
        await this.chatService.addUserToRoom(createDMRoomDto.user2Id, roomId);
        this.server.emit('create dm room');
    }
    async handleAddUserToRoom(addUserDto) {
        await this.chatService.addUserToRoom(addUserDto.userId, addUserDto.roomId);
        this.server.emit('add user to room');
    }
    async handleAddAdminToRoom(addAdminDto) {
        await this.chatService.addAdminToRoom(addAdminDto.userId, addAdminDto.roomId);
        this.server.to(addAdminDto.roomId.toString()).emit('admin added to room');
    }
    async handleAddMuteToRoom(addMuteDto) {
        await this.chatService.addMuteToRoom(addMuteDto.userId, addMuteDto.roomId, addMuteDto.date);
        let users = await this.chatService.getMutedUsers(addMuteDto.roomId);
        this.server.to(addMuteDto.roomId.toString()).emit('add mute to room');
    }
    async handleGetMutedUsers(client, roomId) {
        let users = await this.chatService.getMutedUsers(roomId);
        client.emit('get muted users', users);
    }
    async handleKickAdminToRoom(addAdminDto) {
        await this.chatService.removeAdminFromRoom(addAdminDto.userId, addAdminDto.roomId);
        this.server.to(addAdminDto.roomId.toString()).emit('admin removed from room');
    }
    async handleRemoveUserFromRoom(removeUserDto) {
        await this.chatService.removeUserFromRoom(removeUserDto.userId, removeUserDto.roomId);
        this.server.to(removeUserDto.roomId.toString()).emit('remove user from room', removeUserDto);
    }
    handleJoinRoom(client, room_id) {
        client.join(room_id);
    }
    handleDisconnectFromRoom(client, room_id) {
        client.leave(room_id);
    }
    async handleLeaveRoom(client, userRoomDto) {
        await this.chatService.removeUserFromRoom(userRoomDto.userId, userRoomDto.roomId);
        client.leave(userRoomDto.roomId.toString());
        client.emit('add user to room');
    }
    async handlemessage(createMessageDto) {
        let msg = await this.chatService.storeMessage(createMessageDto);
        this.server.to(createMessageDto.room.toString()).emit('chat message', msg);
    }
    async handleGetRooms(client, id) {
        let rooms = await this.chatService.getRoomsForUser(id);
        client.emit('get rooms', rooms);
    }
    async handlePublicRooms() {
        let publicRooms = await this.chatService.getPublicRooms();
        this.server.emit('get public rooms', publicRooms);
    }
    async handleGetUsers(client, id) {
        let users = await this.chatService.getUsersInRoom(id);
        client.emit('get users', users);
    }
    async handleGetAdmins(client, id) {
        let admins = await this.chatService.getAdminsInRoom(id);
        client.emit('get admins', admins);
    }
    async handleGetAllMessages(client, id) {
        let messages = await this.chatService.getAllMessagesForUser(id);
        client.emit('get all messages', messages);
    }
    async handeUpdstePassword(updatePasswordDto) {
        if (updatePasswordDto.password != "") {
            bcrypt.hash(updatePasswordDto.password, 10, async (err, hash) => {
                if (err) {
                }
                else
                    await this.chatService.updatePassword(updatePasswordDto.roomId, hash);
            });
        }
        else
            await this.chatService.updatePassword(updatePasswordDto.roomId, updatePasswordDto.password);
        this.server.emit('password updated', updatePasswordDto.roomId);
        this.server.emit('create room');
    }
    async add(client, blockedUserDto) {
        await this.chatService.add(blockedUserDto.userId, blockedUserDto.blockedId);
        const blockedIds = await this.chatService.findAllIds(blockedUserDto.userId);
        const blocked = await this.chatService.findAll(blockedIds);
        client.emit('get blocked', blocked);
    }
    async remove(client, blockedUserDto) {
        await this.chatService.remove(blockedUserDto.userId, blockedUserDto.blockedId);
        const blockedIds = await this.chatService.findAllIds(blockedUserDto.userId);
        const blocked = await this.chatService.findAll(blockedIds);
        client.emit('get blocked', blocked);
    }
    async findAll(client, userId) {
        const blockedIds = await this.chatService.findAllIds(userId);
        const blocked = await this.chatService.findAll(blockedIds);
        client.emit('get blocked', blocked);
    }
    async checkPassword(client, checkPasswordDto) {
        bcrypt.compare(checkPasswordDto.password, await this.chatService.getPassword(checkPasswordDto.roomId), (err, res) => {
            if (err) {
            }
            else
                client.emit('check password', res);
        });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('create room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleCreateRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('create dm room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, create_dm_room_dto_1.CreateDMRoomDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleCreateDMRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add user to room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_room_dto_1.UserRoomDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleAddUserToRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add admin to room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_room_dto_1.UserRoomDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleAddAdminToRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add mute to room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_mute_dto_1.AddMuteDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleAddMuteToRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get muted users'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetMutedUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove admin from room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_room_dto_1.UserRoomDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleKickAdminToRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove user from room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_room_dto_1.UserRoomDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleRemoveUserFromRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('disconnect from room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleDisconnectFromRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_room_dto_1.UserRoomDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handlemessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get rooms'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetRooms", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get public rooms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handlePublicRooms", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get users'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get admins'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetAdmins", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get all messages'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetAllMessages", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update password'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_password_dto_1.UpdatePasswordDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handeUpdstePassword", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add blocked'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, blocked_user_dto_1.BlockedUserDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "add", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove blocked'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, blocked_user_dto_1.BlockedUserDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "remove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get blocked'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "findAll", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('check password'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, check_password_dto_1.CheckPasswordDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "checkPassword", null);
ChatGateway = __decorate([
    (0, common_1.UseFilters)(new validation_filter_1.ValidationFilter()),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: (new config_1.ConfigService).get("FRONT_URL"),
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map