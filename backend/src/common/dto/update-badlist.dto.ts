import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBadlistDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  words?: string;

  @IsOptional()
  @IsInt()
  active?: number;
}
