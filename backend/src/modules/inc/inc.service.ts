import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIncDto, UpdateIncDto, FilterIncDto } from './dto/inc.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IncService {
  constructor(private prisma: PrismaService) {}

  async create(
    createIncDto: CreateIncDto,
    criadoPorId: string,
    nfeFile?: Express.Multer.File,
    fotoFiles?: Express.Multer.File[],
  ) {
    const incData: any = {
      ar: createIncDto.ar,
      nfeNumero: createIncDto.nfeNumero,
      um: createIncDto.um,
      quantidadeRecebida: createIncDto.quantidadeRecebida,
      quantidadeComDefeito: createIncDto.quantidadeComDefeito,
      descricaoNaoConformidade: createIncDto.descricaoNaoConformidade,
      status: 'Em análise',
      criadoPorId,
    };

    if (nfeFile) {
      incData.nfeAnexo = nfeFile.filename;
    }

    const inc = await this.prisma.inc.create({
      data: incData,
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        fotos: true,
      },
    });

    // Adicionar fotos se houver
    if (fotoFiles && fotoFiles.length > 0) {
      const fotosData = fotoFiles.map((file) => ({
        incId: inc.id,
        path: file.filename,
        filename: file.originalname,
      }));

      await this.prisma.incFoto.createMany({
        data: fotosData,
      });
    }

    return this.findOne(inc.id);
  }

  async findAll(filters?: FilterIncDto) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.ar) {
      where.ar = filters.ar;
    }

    if (filters?.dataInicio && filters?.dataFim) {
      where.data = {
        gte: new Date(filters.dataInicio),
        lte: new Date(filters.dataFim),
      };
    }

    return this.prisma.inc.findMany({
      where,
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        fotos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const inc = await this.prisma.inc.findUnique({
      where: { id },
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        fotos: true,
      },
    });

    if (!inc) {
      throw new NotFoundException('INC não encontrado');
    }

    return inc;
  }

  async update(
    id: string,
    updateIncDto: UpdateIncDto,
    nfeFile?: Express.Multer.File,
    fotoFiles?: Express.Multer.File[],
  ) {
    const inc = await this.findOne(id);

    const updateData: any = {
      ar: updateIncDto.ar,
      nfeNumero: updateIncDto.nfeNumero,
      um: updateIncDto.um,
      quantidadeRecebida: updateIncDto.quantidadeRecebida,
      quantidadeComDefeito: updateIncDto.quantidadeComDefeito,
      descricaoNaoConformidade: updateIncDto.descricaoNaoConformidade,
      status: updateIncDto.status,
    };

    if (nfeFile) {
      // Remover arquivo antigo se existir
      if (inc.nfeAnexo) {
        this.deleteFile(inc.nfeAnexo);
      }
      updateData.nfeAnexo = nfeFile.filename;
    }

    const updatedInc = await this.prisma.inc.update({
      where: { id },
      data: updateData,
    });

    // Adicionar novas fotos se houver
    if (fotoFiles && fotoFiles.length > 0) {
      const fotosData = fotoFiles.map((file) => ({
        incId: id,
        path: file.filename,
        filename: file.originalname,
      }));

      await this.prisma.incFoto.createMany({
        data: fotosData,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const inc = await this.findOne(id);

    // Remover arquivos físicos
    if (inc.nfeAnexo) {
      this.deleteFile(inc.nfeAnexo);
    }

    for (const foto of inc.fotos) {
      this.deleteFile(foto.path);
    }

    await this.prisma.inc.delete({ where: { id } });

    return { message: 'INC removido com sucesso' };
  }

  async removeFoto(incId: string, fotoId: string) {
    const foto = await this.prisma.incFoto.findUnique({
      where: { id: fotoId },
    });

    if (!foto || foto.incId !== incId) {
      throw new NotFoundException('Foto não encontrada');
    }

    this.deleteFile(foto.path);

    await this.prisma.incFoto.delete({ where: { id: fotoId } });

    return { message: 'Foto removida com sucesso' };
  }

  private deleteFile(filename: string) {
    try {
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const filePath = path.join(uploadPath, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  }
}
