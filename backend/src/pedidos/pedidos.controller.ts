import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get(':codigo')
  buscar(@Param('codigo') codigo: string) {
    const codigoNormalizado = codigo.trim();

    if (!codigoNormalizado) {
      throw new BadRequestException('Informe o código do pedido');
    }

    return this.pedidosService.buscarPorCodigo(codigoNormalizado);
  }
}
