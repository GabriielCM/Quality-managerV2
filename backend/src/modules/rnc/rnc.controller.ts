import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { RncService } from './rnc.service';
import {
  CreateRncDto,
  UpdateRncDto,
  FilterRncDto,
  AprovarPorConcessaoDto,
  RecusarPlanoAcaoDto,
} from './dto/rnc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('rnc')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RncController {
  constructor(private readonly rncService: RncService) {}

  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';

  @Post()
  @Permissions('rnc.create', 'admin.all')
  create(@Body() createRncDto: CreateRncDto, @Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.rncService.create(createRncDto, userId);
  }

  @Get()
  @Permissions('rnc.read', 'admin.all')
  findAll(@Query() filters: FilterRncDto) {
    return this.rncService.findAll(filters);
  }

  @Get(':id')
  @Permissions('rnc.read', 'admin.all')
  findOne(@Param('id') id: string) {
    return this.rncService.findOne(id);
  }

  @Patch(':id')
  @Permissions('rnc.update', 'admin.all')
  update(@Param('id') id: string, @Body() updateRncDto: UpdateRncDto) {
    return this.rncService.update(id, updateRncDto);
  }

  @Delete(':id')
  @Permissions('rnc.delete', 'admin.all')
  remove(@Param('id') id: string) {
    return this.rncService.remove(id);
  }

  @Post('aprovar-concessao')
  @Permissions('rnc.approve', 'admin.all')
  aprovarPorConcessao(
    @Body() aprovarPorConcessaoDto: AprovarPorConcessaoDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.rncService.aprovarPorConcessao(aprovarPorConcessaoDto, userId);
  }

  @Get('fornecedor/:fornecedorId/anteriores')
  @Permissions('rnc.read', 'admin.all')
  findRncsByFornecedor(
    @Param('fornecedorId') fornecedorId: string,
    @Query('ano') ano?: string,
  ) {
    const anoNumber = ano ? parseInt(ano, 10) : undefined;
    return this.rncService.findRncsByFornecedor(fornecedorId, anoNumber);
  }

  @Get(':id/pdf')
  @Permissions('rnc.read', 'admin.all')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const rnc = await this.rncService.findOne(id);

    if (!rnc.pdfPath) {
      return res.status(404).json({ message: 'PDF não encontrado' });
    }

    const filepath = path.join(this.uploadPath, rnc.pdfPath);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Arquivo PDF não encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${rnc.numero.replace(/[:\/]/g, '-')}.pdf"`,
    );

    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  }

  @Post(':id/aceitar')
  @Permissions('rnc.update', 'admin.all')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `plano-acao-${uuidv4()}.pdf`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  aceitarPlanoAcao(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.rncService.aceitarPlanoAcao(id, file, userId);
  }

  @Post(':id/recusar')
  @Permissions('rnc.update', 'admin.all')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `plano-acao-${uuidv4()}.pdf`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  recusarPlanoAcao(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: RecusarPlanoAcaoDto,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.rncService.recusarPlanoAcao(id, file, dto, userId);
  }

  @Get(':id/historico')
  @Permissions('rnc.read', 'admin.all')
  getHistorico(@Param('id') id: string) {
    return this.rncService.getHistorico(id);
  }

  @Get(':id/plano-acao-pdf')
  @Permissions('rnc.read', 'admin.all')
  async downloadPlanoAcaoPdf(@Param('id') id: string, @Res() res: Response) {
    const rnc = await this.rncService.findOne(id);

    if (!rnc.planoAcaoPdfPath) {
      return res
        .status(404)
        .json({ message: 'PDF do plano de ação não encontrado' });
    }

    const filepath = path.join(this.uploadPath, rnc.planoAcaoPdfPath);

    if (!fs.existsSync(filepath)) {
      return res
        .status(404)
        .json({ message: 'Arquivo PDF do plano de ação não encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="plano-acao-${rnc.numero.replace(/[:\/]/g, '-')}.pdf"`,
    );

    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  }

  @Get('historico/:historicoId/pdf')
  @Permissions('rnc.read', 'admin.all')
  async downloadHistoricoPdf(
    @Param('historicoId') historicoId: string,
    @Res() res: Response,
  ) {
    const historico = await this.rncService.findHistoricoItem(historicoId);

    if (!historico.pdfPath) {
      return res
        .status(404)
        .json({ message: 'PDF do histórico não encontrado' });
    }

    const filepath = path.join(this.uploadPath, historico.pdfPath);

    if (!fs.existsSync(filepath)) {
      return res
        .status(404)
        .json({ message: 'Arquivo PDF do histórico não encontrado' });
    }

    const tipoTexto = historico.tipo === 'ACEITE' ? 'aceito' : 'recusado';
    const filename = `plano-acao-${tipoTexto}-${new Date(historico.data).toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  }
}
