import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { authenticator } from 'otplib';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(accessToken: string): Promise<number> {
    const { data } = await axios({
      url: 'https://api.intra.42.fr/v2/me',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });
    if (!data) {
      throw new UnauthorizedException();
    }
    return data.id;
  }

  async login(userId: number, isAuthenticated: boolean): Promise<string> {
    const payload = { sub: userId, isAuthenticated };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async validateGoogleAuthenticatorToken(userId: number, otp: ValidateOtpDto) {
    const { otpSecret } = await this.usersService.findOne(userId);
    const validated = authenticator.check(otp.value, otpSecret);
    return validated;
  }

  async getMock(id: number) {
    return this.usersService.findOrCreateUser(id);
  }
}
