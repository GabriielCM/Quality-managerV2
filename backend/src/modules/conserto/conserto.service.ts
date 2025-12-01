import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateConsertoDto,
  EmitirNfeConsertoDto,
  ConfirmarRetornoDto,
  AprovarInspecaoDto,
  RejeitarInspecaoDto,
  FilterConsertoDto,
  ConsertoStatus,
} from './dto/conserto.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConsertoService {
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

  // Helper: Check existing conserto or devolução for RNC
  private async checkExistingConsertoOrDevolucao(rncId: string): Promise<void> {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id: rncId },
      include: { devolucao: true, conserto: true },
    });

    if (rnc.devolucao) {
      throw new ConflictException('RNC já possui Devolução vinculada');
    }
    if (rnc.conserto) {
      throw new ConflictException('RNC já possui Conserto vinculado');
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

  // 1. CREATE - Criar conserto a partir de RNC
  async create(createConsertoDto: CreateConsertoDto, criadoPorId: string) {
    const { rncId, ...data } = createConsertoDto;

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
        'Só é possível criar conserto para RNC com status "RNC aceita"',
      );
    }

    // Verificar se já existe devolução ou conserto para esta RNC
    await this.checkExistingConsertoOrDevolucao(rncId);

    // Criar conserto
    const conserto = await this.prisma.conserto.create({
      data: {
        rncId,
        arOrigem: rnc.ar,
        quantidadeTotal: data.quantidadeTotal,
        pesoKg: data.pesoKg,
        motivo: data.motivo,
        transportadora: data.transportadora,
        frete: data.frete,
        consertoEmGarantia: data.consertoEmGarantia,
        status: ConsertoStatus.CONSERTO_SOLICITADA,
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

    return conserto;
  }

  // 2. FIND ALL - Listar consertos com filtros
  async findAll(filters?: FilterConsertoDto) {
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

    return this.prisma.conserto.findMany({
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
        retornoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
        inspecaoRealizadaPor: {
          select: { id: true, nome: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. FIND ONE - Buscar um conserto
  async findOne(id: string) {
    const conserto = await this.prisma.conserto.findUnique({
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
        retornoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
        inspecaoRealizadaPor: {
          select: { id: true, nome: true, email: true },
        },
        inspecaoFotos: true,
      },
    });

    if (!conserto) {
      throw new NotFoundException('Conserto não encontrado');
    }

    return conserto;
  }

  // 4. EMITIR NFE - Etapa 2: Registrar NF-e e fazer upload do PDF
  async emitirNfe(
    id: string,
    file: Express.Multer.File,
    dto: EmitirNfeConsertoDto,
    userId: string,
  ) {
    const conserto = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      conserto.status,
      ConsertoStatus.CONSERTO_SOLICITADA,
    );

    if (!file) {
      throw new BadRequestException('Arquivo PDF da NF-e é obrigatório');
    }

    // Atualizar conserto
    const updated = await this.prisma.conserto.update({
      where: { id },
      data: {
        nfeNumero: dto.nfeNumero,
        nfePdfPath: file.filename,
        nfeEmitidaPorId: userId,
        nfeEmitidaEm: new Date(),
        status: ConsertoStatus.NFE_EMITIDA,
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

  // 5. CONFIRMAR COLETA - Etapa 3a (sempre obrigatória)
  async confirmarColeta(id: string, userId: string) {
    const conserto = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(conserto.status, ConsertoStatus.NFE_EMITIDA);

    const updated = await this.prisma.conserto.update({
      where: { id },
      data: {
        dataColeta: new Date(),
        coletaConfirmadaPorId: userId,
        status: ConsertoStatus.CONSERTO_COLETADO,
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

  // 6. CONFIRMAR RECEBIMENTO - Etapa 3b (inicia prazo de 30 dias)
  async confirmarRecebimento(id: string, userId: string) {
    const conserto = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      conserto.status,
      ConsertoStatus.CONSERTO_COLETADO,
    );

    // Calcular prazo de 30 dias
    const prazoInicio = new Date();
    const prazoFim = new Date(prazoInicio);
    prazoFim.setDate(prazoFim.getDate() + 30);

    const updated = await this.prisma.conserto.update({
      where: { id },
      data: {
        dataRecebimento: new Date(),
        recebimentoConfirmadoPorId: userId,
        prazoConsertoInicio: prazoInicio,
        prazoConsertoFim: prazoFim,
        status: ConsertoStatus.CONSERTO_RECEBIDO,
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

  // 7. CONFIRMAR RETORNO - Etapa 3c: Material retorna após conserto
  async confirmarRetorno(
    id: string,
    file: Express.Multer.File,
    dto: ConfirmarRetornoDto,
    userId: string,
  ) {
    const conserto = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      conserto.status,
      ConsertoStatus.CONSERTO_RECEBIDO,
    );

    if (!file) {
      throw new BadRequestException('Arquivo PDF da NF-e de retorno é obrigatório');
    }

    const updated = await this.prisma.conserto.update({
      where: { id },
      data: {
        dataRetorno: new Date(),
        nfeRetornoNumero: dto.nfeRetornoNumero,
        nfeRetornoPdfPath: file.filename,
        retornoConfirmadoPorId: userId,
        status: ConsertoStatus.MATERIAL_RETORNADO,
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
        retornoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return updated;
  }

  // 8. APROVAR INSPEÇÃO - Etapa 4a: Aprovar com fotos
  async aprovarInspecao(
    id: string,
    files: Express.Multer.File[],
    dto: AprovarInspecaoDto,
    userId: string,
  ) {
    const conserto = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      conserto.status,
      ConsertoStatus.MATERIAL_RETORNADO,
    );

    if (!files || files.length === 0) {
      throw new BadRequestException('Pelo menos uma foto é obrigatória');
    }

    if (files.length > 10) {
      throw new BadRequestException('Máximo de 10 fotos permitidas');
    }

    // Atualizar conserto
    const updated = await this.prisma.conserto.update({
      where: { id },
      data: {
        inspecaoAprovada: true,
        inspecaoData: new Date(),
        inspecaoDescricao: dto.inspecaoDescricao || null,
        inspecaoRealizadaPorId: userId,
        status: ConsertoStatus.FINALIZADO,
        inspecaoFotos: {
          create: files.map((file) => ({
            path: file.filename,
            filename: file.originalname,
          })),
        },
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
        retornoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
        inspecaoRealizadaPor: {
          select: { id: true, nome: true, email: true },
        },
        inspecaoFotos: true,
      },
    });

    return updated;
  }

  // 9. REJEITAR INSPEÇÃO - Etapa 4b: Rejeitar com fotos e descrição obrigatória
  async rejeitarInspecao(
    id: string,
    files: Express.Multer.File[],
    dto: RejeitarInspecaoDto,
    userId: string,
  ) {
    const conserto = await this.findOne(id);

    // Validar status
    this.validateStatusTransition(
      conserto.status,
      ConsertoStatus.MATERIAL_RETORNADO,
    );

    if (!files || files.length === 0) {
      throw new BadRequestException('Pelo menos uma foto é obrigatória');
    }

    if (files.length > 10) {
      throw new BadRequestException('Máximo de 10 fotos permitidas');
    }

    if (!dto.inspecaoDescricao || dto.inspecaoDescricao.trim() === '') {
      throw new BadRequestException('Descrição da rejeição é obrigatória');
    }

    // Atualizar conserto
    const updated = await this.prisma.conserto.update({
      where: { id },
      data: {
        inspecaoAprovada: false,
        inspecaoData: new Date(),
        inspecaoDescricao: dto.inspecaoDescricao,
        inspecaoRealizadaPorId: userId,
        status: ConsertoStatus.REJEITADO,
        inspecaoFotos: {
          create: files.map((file) => ({
            path: file.filename,
            filename: file.originalname,
          })),
        },
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
        retornoConfirmadoPor: {
          select: { id: true, nome: true, email: true },
        },
        inspecaoRealizadaPor: {
          select: { id: true, nome: true, email: true },
        },
        inspecaoFotos: true,
      },
    });

    return updated;
  }

  // 10. DOWNLOAD NF-e PDF
  async downloadNfePdf(id: string): Promise<string> {
    const conserto = await this.findOne(id);

    if (!conserto.nfePdfPath) {
      throw new NotFoundException('NF-e PDF não encontrado');
    }

    const filepath = path.join(this.uploadPath, conserto.nfePdfPath);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Arquivo PDF não encontrado no servidor');
    }

    return filepath;
  }

  // 11. DOWNLOAD NF-e RETORNO PDF
  async downloadNfeRetornoPdf(id: string): Promise<string> {
    const conserto = await this.findOne(id);

    if (!conserto.nfeRetornoPdfPath) {
      throw new NotFoundException('NF-e de retorno PDF não encontrado');
    }

    const filepath = path.join(this.uploadPath, conserto.nfeRetornoPdfPath);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Arquivo PDF de retorno não encontrado no servidor');
    }

    return filepath;
  }

  // 12. DOWNLOAD FOTO DE INSPEÇÃO
  async downloadInspecaoFoto(consertoId: string, fotoId: string): Promise<string> {
    const foto = await this.prisma.consertoInspecaoFoto.findFirst({
      where: {
        id: fotoId,
        consertoId: consertoId,
      },
    });

    if (!foto) {
      throw new NotFoundException('Foto de inspeção não encontrada');
    }

    const filepath = path.join(this.uploadPath, foto.path);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Arquivo de foto não encontrado no servidor');
    }

    return filepath;
  }

  // 13. REMOVE - Deletar conserto (com cleanup de arquivos)
  async remove(id: string) {
    const conserto = await this.findOne(id);

    // Deletar arquivos físicos se existirem
    if (conserto.nfePdfPath) {
      this.deleteFile(conserto.nfePdfPath);
    }
    if (conserto.nfeRetornoPdfPath) {
      this.deleteFile(conserto.nfeRetornoPdfPath);
    }

    // Deletar fotos de inspeção
    if (conserto.inspecaoFotos && conserto.inspecaoFotos.length > 0) {
      conserto.inspecaoFotos.forEach((foto) => {
        this.deleteFile(foto.path);
      });
    }

    // Deletar do banco (cascade vai deletar fotos relacionadas)
    await this.prisma.conserto.delete({ where: { id } });

    return { message: 'Conserto removido com sucesso' };
  }
}
