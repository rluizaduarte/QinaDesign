import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('etapas')
@UseGuards(JwtAuthGuard)
export class EtapasController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  listar() {
    return this.prisma.etapa.findMany({
      orderBy: { ordem: 'asc' },
      select: { id: true, nome: true, ordem: true },
    });
  }
}
