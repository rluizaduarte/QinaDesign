import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AndamentoModule } from './andamento/andamento.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PedidosModule,
    AndamentoModule,
    UsuariosModule,
    AuthModule,
    FuncionariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
