import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { FriendUserDto } from './dto/friend-user.dto';
import { Socket, Server } from 'socket.io';
import { UsersService } from './users.service';
import { ChatService } from 'src/chat/chat.service';
import { InviteDto } from './dto/invite.dto';
export declare class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly usersService;
    private readonly chatService;
    constructor(usersService: UsersService, chatService: ChatService);
    server: Server;
    add(client: Socket, friendUserDto: FriendUserDto): Promise<void>;
    remove(client: Socket, friendUserDto: FriendUserDto): Promise<void>;
    findAll(client: Socket, userId: number): Promise<void>;
    handleNewUser(client: Socket, userId: number): Promise<void>;
    handleNewConnection(client: Socket, userId: number): Promise<void>;
    countdown_start(client: Socket, userId: number): void;
    handleRemoveGamer(client: Socket, userId: number): void;
    inviteForGame(client: Socket, inviteDto: InviteDto): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
}
