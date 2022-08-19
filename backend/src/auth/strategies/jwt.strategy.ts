import { Injectable, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.cookieExtractor]),
      secretOrKey: jwtConstants.secret,
    });
  }

  static cookieExtractor(req) {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['jwt'];
    }
    return token;
  }

  async validate(payload: any): Promise<any> {
    if (payload.isAuthenticated === true) {
      const user = { id: payload.sub };
      return user;
    }
  }
}
