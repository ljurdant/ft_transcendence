import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { JwtStrategy } from './jwt.strategy';

@Injectable()
export class JwtOtpStrategy extends PassportStrategy(Strategy, 'jwt-otp') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.cookieExtractor]),
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<any> {
    if (payload.isAuthenticated === false) {
      const user = { id: payload.sub };
      return user;
    }
  }
}
