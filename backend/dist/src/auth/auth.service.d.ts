import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ValidateOtpDto } from './dto/validate-otp.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(accessToken: string): Promise<number>;
    login(userId: number, isAuthenticated: boolean): Promise<string>;
    validateGoogleAuthenticatorToken(userId: number, otp: ValidateOtpDto): Promise<boolean>;
    getMock(id: number): Promise<import(".prisma/client").User>;
}
