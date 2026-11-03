import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AtualizarPedidoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nomeCliente?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  titulo?: string;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;
}