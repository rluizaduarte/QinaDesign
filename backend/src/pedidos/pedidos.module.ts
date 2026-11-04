import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';

@Module({
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}