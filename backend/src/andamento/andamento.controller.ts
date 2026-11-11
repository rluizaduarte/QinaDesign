import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { AndamentoService } from './andamento.service';
import { AtualizarEtapaDto } from './dto/atualizar-etapa.dto';
import { AtualizarObservacaoDto } from './dto/atualizar-observacao.dto';

// PROVISÓRIO até a Etapa 4: TODO trocar por req.user.id (JwtAuthGuard).
// O id NUNCA deve vir do body ou da query.
const USUARIO_PROVISORIO_ID = 1;

@Controller('pedidos/:pedidoId')
export class AndamentoController {
  constructor(private readonly andamentoService: AndamentoService) {}

  // ADMINISTRADOR ou FUNCIONARIO (proteger na Etapa 4)
  @Patch('etapa')
  atualizarEtapa(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body() dto: AtualizarEtapaDto,
  ) {
    return this.andamentoService.atualizarEtapa(
      pedidoId,
      dto.novaEtapaId,
      USUARIO_PROVISORIO_ID,
    );
  }

  // ADMINISTRADOR ou FUNCIONARIO (proteger na Etapa 4)
  @Patch('observacao')
  atualizarObservacao(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body() dto: AtualizarObservacaoDto,
  ) {
    return this.andamentoService.atualizarObservacao(
      pedidoId,
      USUARIO_PROVISORIO_ID,
      dto.observacao,
    );
  }

  // ADMINISTRADOR ou FUNCIONARIO (proteger na Etapa 4)
  @Get('historico')
  consultarHistorico(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return this.andamentoService.consultarHistorico(
      pedidoId,
      USUARIO_PROVISORIO_ID,
    );
  }
}
