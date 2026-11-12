import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EtapasController } from './etapas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EtapasController],
})
export class EtapasModule {}
