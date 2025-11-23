import { Module } from '@nestjs/common';
import { RncController } from './rnc.controller';
import { RncService } from './rnc.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RncController],
  providers: [RncService]
})
export class RncModule {}
