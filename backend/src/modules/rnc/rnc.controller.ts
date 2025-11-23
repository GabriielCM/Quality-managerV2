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
} from '@nestjs/common';
import { RncService } from './rnc.service';
import {
  CreateRncDto,
  UpdateRncDto,
  FilterRncDto,
  AprovarPorConcessaoDto,
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
}
