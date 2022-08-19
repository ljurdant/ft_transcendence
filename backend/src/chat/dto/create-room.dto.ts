import { IsNumber, IsString, Length, MaxLength, MinLength } from "class-validator";

export class CreateRoomDto {
    @IsString()
    @Length(2, 16)
    name: string;

    @IsNumber()
    userId: number;
    
    @IsString()
    visibility: string;
    
    @IsString()
    @MaxLength(16)
    password:string;
};