import { IsNumber, IsString } from "class-validator";

export class CreateDMRoomDto {
    @IsString()
    name: string;
    
    @IsNumber()
    user1Id: number;
    
    @IsNumber()
    user2Id: number;
}