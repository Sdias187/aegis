import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateFichaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  atendimentoPara?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  servico?: string;

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
