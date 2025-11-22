import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto, UpdateFornecedorDto, FilterFornecedorDto } from './dto/fornecedor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Fornecedores')
@Controller('fornecedores')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Post()
  @Permissions('fornecedores.create', 'admin.all')
  @ApiOperation({ summary: 'Criar novo fornecedor' })
  @ApiResponse({ status: 201, description: 'Fornecedor criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado' })
  create(@Body() createFornecedorDto: CreateFornecedorDto) {
    return this.fornecedoresService.create(createFornecedorDto);
  }

  @Get()
  @Permissions('fornecedores.read', 'admin.all')
  @ApiOperation({ summary: 'Listar todos os fornecedores' })
  @ApiResponse({ status: 200, description: 'Lista de fornecedores retornada com sucesso' })
  findAll(@Query() filters: FilterFornecedorDto) {
    return this.fornecedoresService.findAll(filters);
  }

  @Get(':id')
  @Permissions('fornecedores.read', 'admin.all')
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  @ApiResponse({ status: 200, description: 'Fornecedor encontrado' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado' })
  findOne(@Param('id') id: string) {
    return this.fornecedoresService.findOne(id);
  }

  @Patch(':id')
  @Permissions('fornecedores.update', 'admin.all')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  @ApiResponse({ status: 200, description: 'Fornecedor atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado para outro fornecedor' })
  update(@Param('id') id: string, @Body() updateFornecedorDto: UpdateFornecedorDto) {
    return this.fornecedoresService.update(id, updateFornecedorDto);
  }

  @Delete(':id')
  @Permissions('fornecedores.delete', 'admin.all')
  @ApiOperation({ summary: 'Remover fornecedor' })
  @ApiResponse({ status: 200, description: 'Fornecedor removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado' })
  remove(@Param('id') id: string) {
    return this.fornecedoresService.remove(id);
  }
}
