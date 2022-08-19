import { IsNumber } from "class-validator";

export class FriendUserDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    friendId: number;
}