import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

export const jwtConstants = {
  secret: new ConfigService().get('JWT_SECRET'),
};

export const cookieOptions: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
};