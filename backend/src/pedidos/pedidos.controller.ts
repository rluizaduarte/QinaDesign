import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AtualizarPedidoDto } from './dto/atualizar-pedido.dto';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { ListarPedidosQueryDto } from './dto/listar-pedidos-query.dto';
import { PedidosService } from './pedidos.service';

interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  perfil: 'ADMINISTRADOR' | 'FUNCIONARIO';
}

type RequisicaoAutenticada = Request & {
  user: UsuarioAutenticado;
};

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  criar(@Body() dto: CriarPedidoDto, @Req() request: RequisicaoAutenticada) {
    return this.pedidosService.criar(dto, request.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  listar(
    @Query() query: ListarPedidosQueryDto,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.pedidosService.listar(query, request.user.id);
  }

  @Get('pesquisa')
  @UseGuards(JwtAuthGuard)
  pesquisar(
    @Query() query: ListarPedidosQueryDto,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.pedidosService.listar(query, request.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarPedidoDto,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.pedidosService.atualizar(id, dto, request.user.id);
  }

  @Get(':codigo')
  consultarPorCodigo(@Param('codigo') codigo: string) {
    const codigoNormalizado = codigo.trim();

    if (!codigoNormalizado) {
      throw new BadRequestException('Informe o código do pedido');
    }

    return this.pedidosService.buscarPorCodigo(codigoNormalizado);
  }
}
