import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: loginDto.email },
    });

    // mesma mensagem para e-mail inexistente e senha errada
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaConfere = await bcrypt.compare(
      loginDto.senha,
      usuario.senhaHash,
    );
    if (!senhaConfere) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // só revela que está inativo depois de a senha estar correta
    if (!usuario.ativo) {
      throw new ForbiddenException('Usuário inativo');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });

    return { accessToken };
  }
}