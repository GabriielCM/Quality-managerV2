import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { IncService } from './inc.service';
import { CreateIncDto, UpdateIncDto, FilterIncDto } from './dto/inc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('INC')
@Controller('inc')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class IncController {
  constructor(private readonly incService: IncService) {}

  @Post()
  @Permissions('inc.create', 'admin.all')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'nfeFile', maxCount: 1 },
      { name: 'fotos', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Criar novo INC' })
  @ApiResponse({ status: 201, description: 'INC criado com sucesso' })
  create(
    @Body() createIncDto: CreateIncDto,
    @Request() req,
    @UploadedFiles()
    files: {
      nfeFile?: Express.Multer.File[];
      fotos?: Express.Multer.File[];
    },
  ) {
    const nfeFile = files?.nfeFile?.[0];
    const fotoFiles = files?.fotos;

    return this.incService.create(createIncDto, req.user.userId, nfeFile, fotoFiles);
  }

  @Get()
  @Permissions('inc.read', 'admin.all')
  @ApiOperation({ summary: 'Listar todos os INCs' })
  @ApiResponse({ status: 200, description: 'Lista de INCs retornada com sucesso' })
  findAll(@Query() filters: FilterIncDto) {
    return this.incService.findAll(filters);
  }

  @Get(':id')
  @Permissions('inc.read', 'admin.all')
  @ApiOperation({ summary: 'Buscar INC por ID' })
  @ApiResponse({ status: 200, description: 'INC encontrado' })
  @ApiResponse({ status: 404, description: 'INC não encontrado' })
  findOne(@Param('id') id: string) {
    return this.incService.findOne(id);
  }

  @Patch(':id')
  @Permissions('inc.update', 'admin.all')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'nfeFile', maxCount: 1 },
      { name: 'fotos', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Atualizar INC' })
  @ApiResponse({ status: 200, description: 'INC atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'INC não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateIncDto: UpdateIncDto,
    @UploadedFiles()
    files: {
      nfeFile?: Express.Multer.File[];
      fotos?: Express.Multer.File[];
    },
  ) {
    const nfeFile = files?.nfeFile?.[0];
    const fotoFiles = files?.fotos;

    return this.incService.update(id, updateIncDto, nfeFile, fotoFiles);
  }

  @Delete(':id')
  @Permissions('inc.delete', 'admin.all')
  @ApiOperation({ summary: 'Remover INC' })
  @ApiResponse({ status: 200, description: 'INC removido com sucesso' })
  @ApiResponse({ status: 404, description: 'INC não encontrado' })
  remove(@Param('id') id: string) {
    return this.incService.remove(id);
  }

  @Delete(':incId/fotos/:fotoId')
  @Permissions('inc.update', 'admin.all')
  @ApiOperation({ summary: 'Remover foto de um INC' })
  @ApiResponse({ status: 200, description: 'Foto removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Foto não encontrada' })
  removeFoto(@Param('incId') incId: string, @Param('fotoId') fotoId: string) {
    return this.incService.removeFoto(incId, fotoId);
  }
}
