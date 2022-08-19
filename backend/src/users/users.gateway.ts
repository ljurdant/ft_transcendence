import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { FriendUserDto } from './dto/friend-user.dto';
import { Socket, Server } from 'socket.io';
import { UsersService } from './users.service';
import { ChatService } from 'src/chat/chat.service';
import { InviteDto } from './dto/invite.dto';

@WebSocketGateway({
  cors: {
    origin: new ConfigService().get('FRONT_URL'),
    credentials: true,
  },
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('add friend')
  async add(
    @ConnectedSocket() client: Socket,
    @MessageBody() friendUserDto: FriendUserDto,
  ) {
    await this.usersService.addFriend(
      friendUserDto.userId,
      friendUserDto.friendId,
    );
    const friendsIds: number[] = await this.usersService.findFriendsIds(friendUserDto.userId);
    const friends = await this.usersService.findFriends(friendsIds);
    client.emit('get friends', friends)
    // return true;
  }

  @SubscribeMessage('remove friend')
  async remove(
    @ConnectedSocket() client: Socket,
    @MessageBody() friendUserDto: FriendUserDto,
  ) {
    await this.usersService.removeFriend(
      friendUserDto.userId,
      friendUserDto.friendId,
    );
    const friendsIds: number[] = await this.usersService.findFriendsIds(friendUserDto.userId);
    const friends = await this.usersService.findFriends(friendsIds);
    client.emit('get friends', friends)  
  }

  @SubscribeMessage('get friends')
  async findAll(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    const friendsIds: number[] = await this.usersService.findFriendsIds(userId);
    const friends = await this.usersService.findFriends(friendsIds);
    // return friends;
    client.emit('get friends', friends)
  }

  @SubscribeMessage('new user')
  async handleNewUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
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

  @SubscribeMessage('new connection')
  async handleNewConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    const allUsers = await this.usersService.getAllUsers();
    this.server.emit('new user', allUsers);
    client.data.userId = userId;
    this.server.emit('new connection', userId);
    const socks = await this.server.fetchSockets();
    const online = socks.map((c) => c.data.userId);
    const inGame = socks.filter((c) => c.data.inGame === true).map((c) => c.data.userId);
    client.emit('status map', { online: online, inGame: inGame });
  }


  @SubscribeMessage('countdown_start')
  countdown_start(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    client.data.inGame = true;
    this.server.emit('new gamer', userId);
  }

  @SubscribeMessage('remove gamer')
  handleRemoveGamer(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    client.data.inGame = false;
  }

  @SubscribeMessage('invite for game')
  async inviteForGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() inviteDto: InviteDto,
  ) {
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

  handleConnection(@ConnectedSocket() client: Socket) {
    // console.log('client connected');
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.server.emit('new disconnection', client.data.userId);
    // console.log('client disconnected');
  }

}
