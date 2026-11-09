import { IsInt, Min } from 'class-validator';

export class AtualizarEtapaDto {
  @IsInt()
  @Min(1)
  novaEtapaId!: number;
}