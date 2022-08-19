/// <reference types="multer" />
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './interfaces/profile.interface';
import { UserParams } from './params/user.params';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAllUsers(): Promise<any>;
    findMe(req: any): Promise<Profile>;
    updateMe(req: any, updateUserDto: UpdateUserDto): Promise<string>;
    uploadAvatar(req: any, file: Express.Multer.File): boolean;
    findOne(params: UserParams): Promise<Profile>;
}
