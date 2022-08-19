import { IsNotEmpty, IsNumber} from 'class-validator';

export class UserRoomDto {
    @IsNumber()
    userId: number;
    
    @IsNumber()
    roomId: number;
};
