import { AuthService } from './auth.service';
import { Response } from 'express';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    login(req: any, res: Response): Promise<{
        url: any;
    }>;
    googleAuthenticatorLoginCheck(): Promise<boolean>;
    googleAuthenticatorLogin(req: any, res: Response, otp: ValidateOtpDto): Promise<boolean>;
    logout(res: Response): Promise<void>;
    mockLogin(id: string, res: Response): Promise<{
        url: any;
    }>;
}
