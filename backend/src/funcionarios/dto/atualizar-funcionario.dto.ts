import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AtualizarFuncionarioDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  nome?: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  cargo?: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/\D/g, '')
      : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/)
  telefone?: string;
}