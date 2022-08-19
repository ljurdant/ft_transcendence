import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Strategy } from 'passport-oauth2';
import { UserRoomDto } from 'src/chat/dto/user-room.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: configService.get('CLIENT_ID'),
      clientSecret: configService.get('CLIENT_SECRET'),
      callbackURL: configService.get('BACK_URL') + '/auth',
    });
  }

  async validate(accessToken: string): Promise<AuthUser> {
    const userId = await this.authService.validateUser(accessToken);
    const user = await this.usersService.findOrCreateUser(userId);
    const authUser = { id: user.id, isAuthenticated: !user.tfa }
    return authUser;
  }
}
