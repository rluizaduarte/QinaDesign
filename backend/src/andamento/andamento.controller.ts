import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AndamentoService } from './andamento.service';
import { AtualizarEtapaDto } from './dto/atualizar-etapa.dto';
import { AtualizarObservacaoDto } from './dto/atualizar-observacao.dto';

interface UsuarioAutenticado {
  id: number;
}

type RequisicaoAutenticada = Request & {
  user: UsuarioAutenticado;
};

@Controller('pedidos/:pedidoId')
@UseGuards(JwtAuthGuard)
export class AndamentoController {
  constructor(private readonly andamentoService: AndamentoService) {}

  @Patch('etapa')
  atualizarEtapa(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body() dto: AtualizarEtapaDto,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.andamentoService.atualizarEtapa(
      pedidoId,
      dto.novaEtapaId,
      request.user.id,
    );
  }

  @Patch('observacao')
  atualizarObservacao(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body() dto: AtualizarObservacaoDto,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.andamentoService.atualizarObservacao(
      pedidoId,
      request.user.id,
      dto.observacao,
    );
  }

  @Get('historico')
  consultarHistorico(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.andamentoService.consultarHistorico(pedidoId, request.user.id);
  }
}
