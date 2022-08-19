import { Injectable } from '@nestjs/common';
// import { CreateChatDto } from './dto/create-chat.dto';
// import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaClient } from '@prisma/client';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateMessageDto } from './dto/create-message.dto'
import { IsNotEmpty} from 'class-validator';


@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaClient) {}

  async createRoom(createRoomDto: CreateRoomDto) {
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

  async addUserToRoom(userId: number, roomId: number) {
    const room = await this.prisma.room.update({
      where: {id: roomId},
      data: {
        users: {
          connect: {id: userId}       
        }
      }
    });
  }

  async addAdminToRoom(adminId: number, roomId: number) {
    const room = await this.prisma.room.update({
      where: {id: roomId},
      data: {
        admins: {
          connect: {id: adminId}
        }
      }
    });
  }

  async addMuteToRoom(userId: number, roomId: number, date: Date) {
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
      })
    }
    else
    { 
      await this.prisma.mutedRoomtoUser.create({
      data: {
        userId: userId,
        roomId: roomId,
        date: date
      }
      })
    }
  }

  async getMutedUsers(roomId: number) {
    const mutedUsers = await this.prisma.mutedRoomtoUser.findMany({
      where: {roomId: roomId},
      select: {userId: true, date: true}
    })
    return mutedUsers;
  }

  async removeUserFromRoom(userId: number, roomId: number) {
    const room = await this.prisma.room.update({
      where: {id: roomId},
      data: {
        users: {
          disconnect: {id: userId}          
        }
      },
      select: {
        users: true
      }
    });
  }

  async removeAdminFromRoom(adminId: number, roomId: number) {
    const room = await this.prisma.room.update({
      where: {id: roomId},
      data: {
        admins: {
          disconnect: {id: adminId}          
        }
      },
      select: {
        admins: true
      }
    });
  }

  async storeMessage(data: CreateMessageDto) {
    let message = await this.prisma.message.create({
      data: {
        content: data.content,
        userId: data.user,
        roomId: data.room,
      }
    });
    return message;
  }
  
  async getRoomsForUser(id: number) {
    let user = await this.prisma.user.findUnique({
      where: {id: id} ,
      include: {rooms: true}
    })
    return user.rooms;
  }

  async getPublicRooms() {
    let rooms = await this.prisma.room.findMany( {
      where: {visibility: "public"}
    })
    return rooms;
  }

  async getUsersInRoom(id: number) {
    let room = await this.prisma.room.findUnique({
      where: {id: id},
      include: {users: true}
    })
    return room.users;
  }

  async getAdminsInRoom(id: number) {
    let room = await this.prisma.room.findUnique({
      where: {id: id},
      include: {admins: true}
    })
    return room.admins;
  }

  // async getAllUsers() {
  //   let users = await this.prisma.user.findMany();
  //   return (users);
  // }

  async getAllUsers(): Promise<any> {
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

  async getAllMessagesForUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {id: id},
      include: {
        rooms: {
          include: {messages: true}
        }
      }
    });
    let messages = [];
    for (let i = 0; i < user.rooms.length; ++i) {
      messages.push(...user.rooms[i].messages);
    }
    return messages;
  }

  async getMessages(id: number) {
    let room = await this.prisma.room.findUnique({
      where: {id: id},
      include: {messages: true}
    })
    return room.messages;
  }

  async updatePassword(roomId: number, password: string) {
    const updatedRoom = await this.prisma.room.update({
        where: {id: roomId},
        data: {
          password: password,
        }
    })
    return updatedRoom.id;
  }

  async findAllIds(userId: number) {
    const {blockedIds} = await this.prisma.user.findUnique({
      where: {id: userId}, 
      select: {blockedIds: true}
    })
    return(blockedIds);
  }

  async add(userId: number, blockedId: number) {
    const blockedIds: number[] = await this.findAllIds(userId);
    
    await this.prisma.user.update({
      where: {id: userId}, 
      data: {
        blockedIds: {
          set: [...blockedIds, blockedId]
        }
      }
    })
  }

  async remove(userId: number, blockedId: number) {
    const blockedIds:number[] = await this.findAllIds(userId);
    
    await this.prisma.user.update({
      where: {id: userId}, 
      data: {
        blockedIds: {
          set: blockedIds.filter((id) => id !== blockedId)
        }
      }
    })
  }

  async findAll(ids: number[]) {
    const blocked = await this.prisma.user.findMany({
      where: {id: {in: ids}}
    })
    return (blocked);
  }

  async getPassword(roomId: number) { 
    const room = await this.prisma.room.findUnique({
      where: {id: roomId},
      select: {password: true}
    })
    return room.password;
  }

}
