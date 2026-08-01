import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateFichaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  atendimentoPara!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  servico!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ofertaServico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  detalheFalha?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategoria?: string;
}
