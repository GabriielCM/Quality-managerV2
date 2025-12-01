import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDevolucaoDto,
  EmitirNfeDto,
  FilterDevolucaoDto,
  DevolucaoStatus,
} from './dto/devolucao.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DevolucaoService {
  private readonly uploadPath: string;

  constructor(private prisma: PrismaService) {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
  }

  // Helper: Validate status transition
  private validateStatusTransition(
    currentStatus: string,
    expectedStatus: string,
  ): void {
    if (currentStatus !== expectedStatus) {
      throw new BadRequestException(
        `Status atual deve ser "${expectedStatus}". Status atual: "${currentStatus}"`,
      );
    }
  }

  // Helper: Check existing devolução or conserto for RNC
  private async checkExistingDevolucaoOrConserto(rncId: string): Promise<void> {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id: rncId },
      include: { devolucao: true, conserto: true },
    });

    if (rnc?.devolucao) {
      throw new ConflictException(
        'Já existe uma devolução cadastrada para esta RNC',
      );
    }
    if (rnc?.conserto) {
      throw new ConflictException(
        'RNC já possui Conserto vinculado',
      );
    }
  }

  // Helper: Delete physical file
  private deleteFile(filename: string): void {
    try {
      const filepath = path.join(this.uploadPath, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  }

  // 1. CREATE - Criar devolução a partir de RNC
  async create(createDevolucaoDto: CreateDevolucaoDto, criadoPorId: string) {
    const { rncId, ...data } = createDevolucaoDto;

    // Validar se RNC existe e tem status "RNC aceita"
    const rnc = await this.prisma.rnc.findUnique({
      where: { id: rncId },
      include: { fornecedor: true, inc: true },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    if (rnc.status !== 'RNC aceita') {
      throw new BadRequestException(
        'Só é possível criar devolução para RNC com status "RNC aceita"',
      );
    }

    // Verificar se já existe devolução ou conserto para esta RNC
    await this.checkExistingDevolucaoOrConserto(rncId);

    // Criar devolução
    const devolucao = await this.prisma.devolucao.create({
      data: {
        rncId,
        arOrigem: rnc.ar,
        quantidadeTotal: data.quantidadeTotal,
        pesoKg: data.pesoKg,
        motivo: data.motivo,
        transportadora: data.transportadora,
        frete: data.frete,
        meioCompensacao: data.meioCompensacao,
        status: DevolucaoStatus.DEVOLUCAO_SOLICITADA,
        criadoPorId,
      },
      include: {
        rnc: {
          include: {
            fornecedor: true,
            inc: true,
          },
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return devolucao;
  }

  // 2. FIND ALL - Listar devoluções com filtros
  async findAll(filters?: FilterDevolucaoDto) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.rncId) {
      where.rncId = filters.rncId;
    }

    if (filters?.fornecedorId) {
      where.rnc = {
        fornecedorId: filters.fornecedorId,
      };
    }

    return this.prisma.devolucao.findMany({
      where,
      include: {
        rnc: {
          include: {
            fornecedor: true,
            inc: true,
          },
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
        nfeEmitidaPor: {
          select: { id: true, nome: true, email: true },
        },
        coletaConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
        recebimentoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
        compensacaoConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. FIND ONE - Buscar uma devolução
  async findOne(id: string) {
    const devolucao = await this.prisma.devolucao.findUnique({
      where: { id },
      include: {
        rnc: {
          include: {
            fornecedor: true,
            inc: true,
          },
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
        nfeEmitidaPor: {
          select: { id: true, nome: true, email: true },
        },
        coletaConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
        recebimentoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
        compensacaoConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    if (!devolucao) {
      throw new NotFoundException('Devolução não encontrada');
    }

    return devolucao;
  }

  // 4. EMITIR NFE - Etapa 2: Registrar NF-e e fazer upload do PDF
  async emitirNfe(
    id: string,
    file: Express.Multer.File,
    dto: EmitirNfeDto,
    userId: string,
  ) {
    const devolucao = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      devolucao.status,
      DevolucaoStatus.DEVOLUCAO_SOLICITADA,
    );

    if (!file) {
      throw new BadRequestException('Arquivo PDF da NF-e é obrigatório');
    }

    // Atualizar devolução
    const updated = await this.prisma.devolucao.update({
      where: { id },
      data: {
        nfeNumero: dto.nfeNumero,
        nfePdfPath: file.filename,
        nfeEmitidaPorId: userId,
        nfeEmitidaEm: new Date(),
        status: DevolucaoStatus.NFE_EMITIDA,
      },
      include: {
        rnc: {
          include: {
            fornecedor: true,
            inc: true,
          },
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
        nfeEmitidaPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return updated;
  }

  // 5. CONFIRMAR COLETA - Etapa 3a
  async confirmarColeta(id: string, userId: string) {
    const devolucao = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(devolucao.status, DevolucaoStatus.NFE_EMITIDA);

    const updated = await this.prisma.devolucao.update({
      where: { id },
      data: {
        dataColeta: new Date(),
        coletaConfirmadaPorId: userId,
        status: DevolucaoStatus.DEVOLUCAO_COLETADA,
      },
      include: {
        rnc: {
          include: {
            fornecedor: true,
            inc: true,
          },
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
        nfeEmitidaPor: {
          select: { id: true, nome: true, email: true },
        },
        coletaConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return updated;
  }

  // 6. CONFIRMAR RECEBIMENTO - Etapa 3b
  async confirmarRecebimento(id: string, userId: string) {
    const devolucao = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      devolucao.status,
      DevolucaoStatus.DEVOLUCAO_COLETADA,
    );

    const updated = await this.prisma.devolucao.update({
      where: { id },
      data: {
        dataRecebimento: new Date(),
        recebimentoConfirmadoPorId: userId,
        status: DevolucaoStatus.DEVOLUCAO_RECEBIDA,
      },
      include: {
        rnc: {
          include: {
            fornecedor: true,
            inc: true,
          },
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
        nfeEmitidaPor: {
          select: { id: true, nome: true, email: true },
        },
        coletaConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
        recebimentoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return updated;
  }

  // 7. CONFIRMAR COMPENSAÇÃO - Etapa 4 (Final)
  async confirmarCompensacao(
    id: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    const devolucao = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      devolucao.status,
      DevolucaoStatus.DEVOLUCAO_RECEBIDA,
    );

    if (!file) {
      throw new BadRequestException(
        'Comprovante de compensação é obrigatório',
      );
    }

    const updated = await this.prisma.devolucao.update({
      where: { id },
      data: {
        dataCompensacao: new Date(),
        comprovantePath: file.path,
        compensacaoConfirmadaPorId: userId,
        status: DevolucaoStatus.FINALIZADO,
      },
      include: {
        rnc: {
          include: {
            fornecedor: true,
            inc: true,
          },
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
        nfeEmitidaPor: {
          select: { id: true, nome: true, email: true },
        },
        coletaConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
        recebimentoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
        compensacaoConfirmadaPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return updated;
  }

  // 8. DOWNLOAD NF-e PDF
  async downloadNfePdf(id: string): Promise<string> {
    const devolucao = await this.findOne(id);

    if (!devolucao.nfePdfPath) {
      throw new NotFoundException('NF-e PDF não encontrado');
    }

    const filepath = path.join(this.uploadPath, devolucao.nfePdfPath);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Arquivo PDF não encontrado no servidor');
    }

    return filepath;
  }

  // 9. DOWNLOAD COMPROVANTE DE COMPENSAÇÃO
  async downloadComprovante(id: string): Promise<string> {
    const devolucao = await this.findOne(id);

    if (!devolucao.comprovantePath) {
      throw new NotFoundException('Comprovante não encontrado');
    }

    const filepath = path.join(this.uploadPath, devolucao.comprovantePath);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Arquivo de comprovante não encontrado no servidor');
    }

    return filepath;
  }

  // 10. REMOVE - Deletar devolução (com cleanup de arquivo)
  async remove(id: string) {
    const devolucao = await this.findOne(id);

    // Deletar arquivos físicos se existirem
    if (devolucao.nfePdfPath) {
      this.deleteFile(devolucao.nfePdfPath);
    }
    if (devolucao.comprovantePath) {
      this.deleteFile(devolucao.comprovantePath);
    }

    // Deletar do banco
    await this.prisma.devolucao.delete({ where: { id } });

    return { message: 'Devolução removida com sucesso' };
  }
}
