import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { DevolucaoController } from './devolucao.controller';
import { DevolucaoService } from './devolucao.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.UPLOAD_PATH || './uploads';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `nfe-devolucao-${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      },
    }),
  ],
  controllers: [DevolucaoController],
  providers: [DevolucaoService],
  exports: [DevolucaoService],
})
export class DevolucaoModule {}
