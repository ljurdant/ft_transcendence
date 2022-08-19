import { IsNumber } from "class-validator";

export class InviteDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    otherUserId: number;
}