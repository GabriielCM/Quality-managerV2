import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DevolucaoService } from './devolucao.service';
import {
  CreateDevolucaoDto,
  EmitirNfeDto,
  FilterDevolucaoDto,
} from './dto/devolucao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('devolucao')
@Controller('devolucao')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DevolucaoController {
  constructor(private readonly devolucaoService: DevolucaoService) {}

  @Post()
  @Permissions('devolucao.create', 'admin.all')
  @ApiOperation({ summary: 'Criar solicitação de devolução a partir de RNC' })
  create(@Body() createDevolucaoDto: CreateDevolucaoDto, @Request() req) {
    const userId = req.user?.userId;
    return this.devolucaoService.create(createDevolucaoDto, userId);
  }

  @Get()
  @Permissions('devolucao.read', 'admin.all')
  @ApiOperation({ summary: 'Listar todas as devoluções com filtros' })
  findAll(@Query() filters: FilterDevolucaoDto) {
    return this.devolucaoService.findAll(filters);
  }

  @Get(':id')
  @Permissions('devolucao.read', 'admin.all')
  @ApiOperation({ summary: 'Buscar uma devolução por ID' })
  findOne(@Param('id') id: string) {
    return this.devolucaoService.findOne(id);
  }

  @Post(':id/emitir-nfe')
  @Permissions('devolucao.emitir_nfe', 'admin.all')
  @UseInterceptors(
    FileInterceptor('nfePdf', {
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `nfe-devolucao-${uuidv4()}.pdf`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Apenas arquivos PDF são permitidos para NF-e',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Etapa 2: Emitir NF-e e fazer upload do PDF' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nfeNumero: { type: 'string' },
        nfePdf: { type: 'string', format: 'binary' },
      },
    },
  })
  emitirNfe(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: EmitirNfeDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.devolucaoService.emitirNfe(id, file, dto, userId);
  }

  @Post(':id/confirmar-coleta')
  @Permissions('devolucao.confirmar_coleta', 'admin.all')
  @ApiOperation({ summary: 'Etapa 3a: Confirmar coleta da mercadoria' })
  confirmarColeta(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.devolucaoService.confirmarColeta(id, userId);
  }

  @Post(':id/confirmar-recebimento')
  @Permissions('devolucao.confirmar_recebimento', 'admin.all')
  @ApiOperation({ summary: 'Etapa 3b: Confirmar recebimento da mercadoria' })
  confirmarRecebimento(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.devolucaoService.confirmarRecebimento(id, userId);
  }

  @Post(':id/confirmar-compensacao')
  @Permissions('devolucao.confirmar_compensacao', 'admin.all')
  @ApiOperation({ summary: 'Etapa 4: Confirmar compensação fiscal (finaliza)' })
  confirmarCompensacao(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.devolucaoService.confirmarCompensacao(id, userId);
  }

  @Get(':id/nfe-pdf')
  @Permissions('devolucao.read', 'admin.all')
  @ApiOperation({ summary: 'Download do PDF da NF-e de devolução' })
  async downloadNfePdf(@Param('id') id: string, @Res() res: Response) {
    const filepath = await this.devolucaoService.downloadNfePdf(id);
    return res.sendFile(filepath, { root: '.' });
  }

  @Delete(':id')
  @Permissions('devolucao.delete', 'admin.all')
  @ApiOperation({ summary: 'Deletar devolução' })
  remove(@Param('id') id: string) {
    return this.devolucaoService.remove(id);
  }
}
