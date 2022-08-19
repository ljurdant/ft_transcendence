import { IsNumber, IsString, MaxLength } from "class-validator";

export class CheckPasswordDto {
    @IsString()
    @MaxLength(16)
    password: string;

    @IsNumber()
    roomId: number;
}