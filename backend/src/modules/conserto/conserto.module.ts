import { Module } from '@nestjs/common';
import { ConsertoController } from './conserto.controller';
import { ConsertoService } from './conserto.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConsertoController],
  providers: [ConsertoService],
  exports: [ConsertoService],
})
export class ConsertoModule {}
