import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IncModule } from './modules/inc/inc.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { FornecedoresModule } from './modules/fornecedores/fornecedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PermissionsModule,
    IncModule,
    FornecedoresModule,
  ],
})
export class AppModule {}
