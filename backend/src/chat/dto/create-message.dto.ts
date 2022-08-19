import { IsBoolean, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @MaxLength(1024)
    content: string;

    @IsNumber()
    user: number;
    
    @IsNumber()
    room: number;

    @IsBoolean()
    type: boolean;
}