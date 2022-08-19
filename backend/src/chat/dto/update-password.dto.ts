import { IsNumber, IsString, MaxLength } from "class-validator";

export class UpdatePasswordDto {
    @IsNumber()
    roomId: number;

    @IsString()
    @MaxLength(16)
    password: string;
}