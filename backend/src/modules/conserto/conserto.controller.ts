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
  UploadedFiles,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConsertoService } from './conserto.service';
import {
  CreateConsertoDto,
  EmitirNfeConsertoDto,
  ConfirmarRetornoDto,
  AprovarInspecaoDto,
  RejeitarInspecaoDto,
  FilterConsertoDto,
} from './dto/conserto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('conserto')
@Controller('conserto')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ConsertoController {
  constructor(private readonly consertoService: ConsertoService) {}

  @Post()
  @Permissions('conserto.create', 'admin.all')
  @ApiOperation({ summary: 'Criar solicitação de conserto a partir de RNC' })
  create(@Body() createConsertoDto: CreateConsertoDto, @Request() req) {
    const userId = req.user?.userId;
    return this.consertoService.create(createConsertoDto, userId);
  }

  @Get()
  @Permissions('conserto.read', 'admin.all')
  @ApiOperation({ summary: 'Listar todos os consertos com filtros' })
  findAll(@Query() filters: FilterConsertoDto) {
    return this.consertoService.findAll(filters);
  }

  @Get(':id')
  @Permissions('conserto.read', 'admin.all')
  @ApiOperation({ summary: 'Buscar um conserto por ID' })
  findOne(@Param('id') id: string) {
    return this.consertoService.findOne(id);
  }

  @Post(':id/emitir-nfe')
  @Permissions('conserto.emitir_nfe', 'admin.all')
  @UseInterceptors(
    FileInterceptor('nfePdf', {
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `conserto-nfe-${uuidv4()}.pdf`;
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
    @Body() dto: EmitirNfeConsertoDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.consertoService.emitirNfe(id, file, dto, userId);
  }

  @Post(':id/confirmar-coleta')
  @Permissions('conserto.confirmar_coleta', 'admin.all')
  @ApiOperation({ summary: 'Etapa 3a: Confirmar coleta do material (sempre obrigatória)' })
  confirmarColeta(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.consertoService.confirmarColeta(id, userId);
  }

  @Post(':id/confirmar-recebimento')
  @Permissions('conserto.confirmar_recebimento', 'admin.all')
  @ApiOperation({ summary: 'Etapa 3b: Confirmar recebimento do material (inicia prazo de 30 dias)' })
  confirmarRecebimento(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.consertoService.confirmarRecebimento(id, userId);
  }

  @Post(':id/confirmar-retorno')
  @Permissions('conserto.confirmar_retorno', 'admin.all')
  @UseInterceptors(
    FileInterceptor('nfeRetornoPdf', {
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `conserto-retorno-nfe-${uuidv4()}.pdf`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Apenas arquivos PDF são permitidos para NF-e de retorno',
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
  @ApiOperation({ summary: 'Etapa 3c: Confirmar retorno do material após conserto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nfeRetornoNumero: { type: 'string' },
        nfeRetornoPdf: { type: 'string', format: 'binary' },
      },
    },
  })
  confirmarRetorno(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ConfirmarRetornoDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.consertoService.confirmarRetorno(id, file, dto, userId);
  }

  @Post(':id/aprovar-inspecao')
  @Permissions('conserto.aprovar_inspecao', 'admin.all')
  @UseInterceptors(
    FilesInterceptor('fotos', 10, {  // Máximo 10 fotos
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const uniqueName = `conserto-inspecao-${uuidv4()}.${ext}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Apenas imagens JPG ou PNG são permitidas',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por foto
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Etapa 4a: Aprovar inspeção com upload de fotos' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fotos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        inspecaoDescricao: { type: 'string', required: false },
      },
    },
  })
  aprovarInspecao(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: AprovarInspecaoDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.consertoService.aprovarInspecao(id, files, dto, userId);
  }

  @Post(':id/rejeitar-inspecao')
  @Permissions('conserto.rejeitar_inspecao', 'admin.all')
  @UseInterceptors(
    FilesInterceptor('fotos', 10, {  // Máximo 10 fotos
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const uniqueName = `conserto-inspecao-${uuidv4()}.${ext}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Apenas imagens JPG ou PNG são permitidas',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por foto
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Etapa 4b: Rejeitar inspeção com upload de fotos e descrição obrigatória' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fotos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        inspecaoDescricao: { type: 'string', required: true },
      },
    },
  })
  rejeitarInspecao(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: RejeitarInspecaoDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    return this.consertoService.rejeitarInspecao(id, files, dto, userId);
  }

  @Get(':id/nfe-pdf')
  @Permissions('conserto.read', 'admin.all')
  @ApiOperation({ summary: 'Download do PDF da NF-e de conserto' })
  async downloadNfePdf(@Param('id') id: string, @Res() res: Response) {
    const filepath = await this.consertoService.downloadNfePdf(id);
    return res.sendFile(filepath, { root: '.' });
  }

  @Get(':id/nfe-retorno-pdf')
  @Permissions('conserto.read', 'admin.all')
  @ApiOperation({ summary: 'Download do PDF da NF-e de retorno' })
  async downloadNfeRetornoPdf(@Param('id') id: string, @Res() res: Response) {
    const filepath = await this.consertoService.downloadNfeRetornoPdf(id);
    return res.sendFile(filepath, { root: '.' });
  }

  @Get(':id/inspecao-fotos/:fotoId')
  @Permissions('conserto.read', 'admin.all')
  @ApiOperation({ summary: 'Download de foto de inspeção' })
  async downloadInspecaoFoto(
    @Param('id') id: string,
    @Param('fotoId') fotoId: string,
    @Res() res: Response,
  ) {
    const filepath = await this.consertoService.downloadInspecaoFoto(id, fotoId);
    return res.sendFile(filepath, { root: '.' });
  }

  @Delete(':id')
  @Permissions('conserto.delete', 'admin.all')
  @ApiOperation({ summary: 'Deletar conserto' })
  remove(@Param('id') id: string) {
    return this.consertoService.remove(id);
  }
}
