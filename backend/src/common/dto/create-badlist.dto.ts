import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBadlistDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  fichaIds!: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  words!: string;

  @IsInt()
  active!: number;
}
