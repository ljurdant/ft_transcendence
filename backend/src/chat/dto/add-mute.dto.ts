import { IsNumber, IsDateString, Min, Max } from "class-validator";

export class AddMuteDto {
    @IsNumber()
    userId: number;

    @IsNumber() 
	@Min(1)
	@Max(60)
    roomId: number;
    
    @IsDateString() 
    date: Date;
}