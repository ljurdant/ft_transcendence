import { IsNumberString, Length } from "class-validator";

export class ValidateOtpDto {
	@IsNumberString()
	@Length(6,6)
	value: string;
}