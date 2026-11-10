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
} from '@nestjs/common';
import { AtualizarPedidoDto } from './dto/atualizar-pedido.dto';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { ListarPedidosQueryDto } from './dto/listar-pedidos-query.dto';
import { PedidosService } from './pedidos.service';

// PROVISÓRIO: enquanto não há autenticação (Etapa 4), usa o admin do seed.
// TODO: substituir por req.user.id (JwtAuthGuard).
// O id NUNCA deve vir do body ou da query.
const USUARIO_PROVISORIO_ID = 1;

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  // ADMINISTRADOR ou FUNCIONARIO (proteger na Etapa 4)
  @Post()
  criar(@Body() dto: CriarPedidoDto) {
    return this.pedidosService.criar(dto, USUARIO_PROVISORIO_ID);
  }

  // ADMINISTRADOR ou FUNCIONARIO (proteger na Etapa 4)
  @Get()
  listar(@Query() query: ListarPedidosQueryDto) {
    return this.pedidosService.listar(query, USUARIO_PROVISORIO_ID);
  }

  // ADMINISTRADOR ou FUNCIONARIO (proteger na Etapa 4)
  // Usa o parâmetro ?search=
  @Get('pesquisa')
  pesquisar(@Query() query: ListarPedidosQueryDto) {
    return this.pedidosService.listar(query, USUARIO_PROVISORIO_ID);
  }

  // ADMINISTRADOR ou FUNCIONARIO (proteger na Etapa 4)
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarPedidoDto,
  ) {
    return this.pedidosService.atualizar(id, dto, USUARIO_PROVISORIO_ID);
  }

  // PÚBLICA (usada pelo front). Declarada por ÚLTIMO entre os GET,
  // senão capturaria "pesquisa".
  @Get(':codigo')
  consultarPorCodigo(@Param('codigo') codigo: string) {
    const codigoNormalizado = codigo.trim();
    if (!codigoNormalizado) {
      throw new BadRequestException('Informe o código do pedido');
    }
    return this.pedidosService.buscarPorCodigo(codigoNormalizado);
  }
}