import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { OAuth2AuthGuard } from './guards/oauth2-auth.guard';
import { JwtOtpAuthGuard } from './guards/jwt-otp-auth.guard';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { cookieOptions } from './constants';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(OAuth2AuthGuard)
  @Get()
  @Redirect()
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.login(
      req.user.id,
      req.user.isAuthenticated,
    );
    res.cookie('jwt', token, cookieOptions);
    let redirectUrl = this.configService.get('FRONT_URL');
    if (req.user.isAuthenticated === false) {
      redirectUrl += '/tfauth';
    }
    return { url: redirectUrl };
  }

  @UseGuards(JwtOtpAuthGuard)
  @Get('google-authenticator')
  async googleAuthenticatorLoginCheck() {
    return true;
  }

  @UseGuards(JwtOtpAuthGuard)
  @Post('google-authenticator')
  async googleAuthenticatorLogin(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Body() otp: ValidateOtpDto,
  ) {
    const validated = await this.authService.validateGoogleAuthenticatorToken(
      req.user.id,
      otp,
    );
    if (validated === true) {
      const token = await this.authService.login(req.user.id, true);
      res.cookie('jwt', token, cookieOptions);
      return true;
    }
    return false;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('jwt', '', { ...cookieOptions, expires: new Date() });
  }

  @Get('mock/:id')
  @Redirect()
  async mockLogin(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.getMock(+id);
    const isAuthenticated = !user.tfa;
    const token = await this.authService.login(user.id, isAuthenticated);
    res.cookie('jwt', token, cookieOptions);
    let redirectUrl = this.configService.get('FRONT_URL');
    if (isAuthenticated === false) {
      redirectUrl += '/tfauth';
    }
    console.log(redirectUrl)
    return { url: redirectUrl };
  }
}
