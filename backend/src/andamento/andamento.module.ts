import { Module } from '@nestjs/common';
import { AndamentoController } from './andamento.controller';
import { AndamentoService } from './andamento.service';

@Module({
  controllers: [AndamentoController],
  providers: [AndamentoService],
})
export class AndamentoModule {}