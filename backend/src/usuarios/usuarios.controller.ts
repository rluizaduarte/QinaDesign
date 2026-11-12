import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { UsuariosService } from './usuarios.service';

type RequisicaoAutenticada = Request & { user: { id: number } };

@Controller('usuarios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  criar(@Body() dto: CriarUsuarioDto) {
    return this.usuariosService.criar(dto);
  }

  @Patch(':id/senha')
  redefinirSenha(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RedefinirSenhaDto,
  ) {
    return this.usuariosService.redefinirSenha(id, dto);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequisicaoAutenticada,
  ) {
    return this.usuariosService.remover(id, request.user.id);
  }
}
