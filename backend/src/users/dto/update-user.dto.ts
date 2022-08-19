import { IsBoolean, IsOptional, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @Matches(/^[\w]{2,16}$/)
  username: string;

  @IsOptional()
  @IsBoolean()
  tfa: boolean;
}
