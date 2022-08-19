import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import * as fs from 'fs/promises';
import { authenticator } from 'otplib';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './interfaces/profile.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async findOrCreateUser(id: number): Promise<User> {
    let user = await this.findOne(id);
    if (!user) {
      user = await this.createUser(id);
    }
    return user;
  }

  async findOne(id: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async createUser(id: number): Promise<User> {
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
    await fs.copyFile(
      '/backend/public/avatars/default.png',
      '/backend/public/avatars/' + id + '.png',
    );
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
    let randomNumber: number;
    let username: string;
    let isNotAvailable: User;
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

  async getUserWithStatsAndMatchHistory(id: number): Promise<any> {
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

  async getProfile(id: number): Promise<Profile> {
    const user = await this.getUserWithStatsAndMatchHistory(id);
    if (!user) {
      throw new NotFoundException();
    }
    const profile: Profile = {
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

  async updateUser(id: number, data: UpdateUserDto): Promise<string> {
    if (Object.keys(data).length != 1) {
      throw new BadRequestException();
    }
    if (data.hasOwnProperty('username')) {
      return this.tryToChangeUsername(id, data.username);
    }
    if (data.hasOwnProperty('tfa')) {
      return this.tryToChangeAuthentication(id, data.tfa);
    }
  }

  async tryToChangeUsername(id: number, newUsername: string) {
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
    } catch {
      throw new ConflictException();
    }
  }

  async tryToChangeAuthentication(id: number, tfa: boolean) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (user.tfa === tfa) {
      throw new ConflictException();
    }
    const secret = tfa === true ? authenticator.generateSecret() : '';
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

  async findFriendsIds(userId: number) {
    const { friendIds } = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { friendIds: true },
    });
    return friendIds;
  }

  async findFriends(ids: number[]) {
    const friends = await this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return friends;
  }

  async addFriend(userId: number, friendId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        friendIds: {
          push: friendId,
        },
      },
    });
  }

  async removeFriend(userId: number, friendId: number) {
    const friendIds: number[] = await this.findFriendsIds(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        friendIds: {
          set: friendIds.filter((id) => id !== friendId),
        },
      },
    });
  }

  async addAchievement(userId: number, achievementId: number) {
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

  async getUsername(id: number) {
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
}
