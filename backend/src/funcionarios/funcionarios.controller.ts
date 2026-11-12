import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { AtualizarFuncionarioDto } from './dto/atualizar-funcionario.dto';
import { CriarFuncionarioDto } from './dto/criar-funcionario.dto';
import { FuncionariosService } from './funcionarios.service';

@Controller('funcionarios')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('ADMINISTRADOR')
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) {}

  @Post()
  criar(@Body() dto: CriarFuncionarioDto) {
    return this.funcionariosService.criar(dto);
  }

  @Get()
  listar() {
    return this.funcionariosService.listar();
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarFuncionarioDto,
  ) {
    return this.funcionariosService.atualizar(id, dto);
  }

  @Patch(':id/desativar')
  desativar(@Param('id', ParseIntPipe) id: number) {
    return this.funcionariosService.desativar(id);
  }

  @Patch(':id/reativar')
  reativar(@Param('id', ParseIntPipe) id: number) {
    return this.funcionariosService.reativar(id);
  }
}
