import { IsNumber } from "class-validator";

export class BlockedUserDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    blockedId: number;
}