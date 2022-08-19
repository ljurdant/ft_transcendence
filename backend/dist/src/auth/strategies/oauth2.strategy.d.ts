/// <reference types="passport-oauth2" />
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';
import { AuthUser } from '../interfaces/auth-user.interface';
declare const OAuth2Strategy_base: new (...args: any[]) => import("passport-oauth2");
export declare class OAuth2Strategy extends OAuth2Strategy_base {
    private usersService;
    private configService;
    private authService;
    constructor(usersService: UsersService, configService: ConfigService, authService: AuthService);
    validate(accessToken: string): Promise<AuthUser>;
}
export {};
