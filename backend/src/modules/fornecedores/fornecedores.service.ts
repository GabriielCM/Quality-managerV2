import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateFornecedorDto, UpdateFornecedorDto, FilterFornecedorDto } from './dto/fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(private prisma: PrismaService) {}

  async create(createFornecedorDto: CreateFornecedorDto) {
    // Verificar se CNPJ já existe
    const existingFornecedor = await this.prisma.fornecedor.findUnique({
      where: { cnpj: createFornecedorDto.cnpj },
    });

    if (existingFornecedor) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    return this.prisma.fornecedor.create({
      data: createFornecedorDto,
    });
  }

  async findAll(filters?: FilterFornecedorDto) {
    const where: any = {};

    if (filters?.cnpj) {
      where.cnpj = {
        contains: filters.cnpj,
      };
    }

    if (filters?.razaoSocial) {
      where.razaoSocial = {
        contains: filters.razaoSocial,
        mode: 'insensitive',
      };
    }

    if (filters?.codigoLogix) {
      where.codigoLogix = {
        contains: filters.codigoLogix,
        mode: 'insensitive',
      };
    }

    return this.prisma.fornecedor.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
    });

    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return fornecedor;
  }

  async findByCnpj(cnpj: string) {
    return this.prisma.fornecedor.findUnique({
      where: { cnpj },
    });
  }

  async update(id: string, updateFornecedorDto: UpdateFornecedorDto) {
    await this.findOne(id);

    // Se estiver atualizando o CNPJ, verificar se já existe
    if (updateFornecedorDto.cnpj) {
      const existingFornecedor = await this.prisma.fornecedor.findUnique({
        where: { cnpj: updateFornecedorDto.cnpj },
      });

      if (existingFornecedor && existingFornecedor.id !== id) {
        throw new ConflictException('CNPJ já cadastrado para outro fornecedor');
      }
    }

    return this.prisma.fornecedor.update({
      where: { id },
      data: updateFornecedorDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.fornecedor.delete({ where: { id } });

    return { message: 'Fornecedor removido com sucesso' };
  }
}
