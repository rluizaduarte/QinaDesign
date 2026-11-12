import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  senha!: string;
}
