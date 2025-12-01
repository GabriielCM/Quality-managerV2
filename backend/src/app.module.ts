import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IncModule } from './modules/inc/inc.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { FornecedoresModule } from './modules/fornecedores/fornecedores.module';
import { RncModule } from './modules/rnc/rnc.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DevolucaoModule } from './modules/devolucao/devolucao.module';
import { ConsertoModule } from './modules/conserto/conserto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PermissionsModule,
    IncModule,
    FornecedoresModule,
    RncModule,
    NotificationsModule,
    DevolucaoModule,
    ConsertoModule,
  ],
})
export class AppModule {}
