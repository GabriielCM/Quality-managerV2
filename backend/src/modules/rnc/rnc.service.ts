import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRncDto,
  UpdateRncDto,
  FilterRncDto,
  AprovarPorConcessaoDto,
  RecusarPlanoAcaoDto,
} from './dto/rnc.dto';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RncService {
  constructor(private prisma: PrismaService) {}

  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';

  /**
   * Gera o próximo número sequencial para RNC de um fornecedor em um determinado ano
   */
  async generateSequencial(fornecedorId: string, ano: number): Promise<number> {
    const ultimaRnc = await this.prisma.rnc.findFirst({
      where: {
        fornecedorId,
        ano,
      },
      orderBy: {
        sequencial: 'desc',
      },
    });

    return ultimaRnc ? ultimaRnc.sequencial + 1 : 1;
  }

  /**
   * Cria uma nova RNC a partir de uma INC
   */
  async create(createRncDto: CreateRncDto, userId: string) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }

    // Buscar a INC original
    const inc = await this.prisma.inc.findUnique({
      where: { id: createRncDto.incId },
      include: {
        fornecedor: true,
        criadoPor: true,
      },
    });

    if (!inc) {
      throw new NotFoundException('INC não encontrada');
    }

    // Validar que a INC está "Em análise"
    if (inc.status !== 'Em análise') {
      throw new BadRequestException(
        'Apenas INCs com status "Em análise" podem gerar RNCs',
      );
    }

    // Se reincidente, validar que a RNC anterior existe e é do mesmo fornecedor
    if (createRncDto.reincidente && createRncDto.rncAnteriorId) {
      const rncAnterior = await this.prisma.rnc.findUnique({
        where: { id: createRncDto.rncAnteriorId },
      });

      if (!rncAnterior) {
        throw new NotFoundException('RNC anterior não encontrada');
      }

      if (rncAnterior.fornecedorId !== inc.fornecedorId) {
        throw new BadRequestException(
          'A RNC anterior deve ser do mesmo fornecedor',
        );
      }
    }

    // Gerar número sequencial e número da RNC
    const dataRnc = createRncDto.data ? new Date(createRncDto.data) : new Date();
    const ano = dataRnc.getFullYear();
    const sequencial = await this.generateSequencial(inc.fornecedorId, ano);
    const numero = `RNC:${sequencial.toString().padStart(3, '0')}/${ano}`;

    // Criar a RNC com prazo inicial de 7 dias
    const prazoInicio = new Date();

    const rnc = await this.prisma.rnc.create({
      data: {
        numero,
        sequencial,
        ano,
        data: dataRnc,
        ar: inc.ar,
        nfeNumero: inc.nfeNumero,
        um: inc.um,
        quantidadeRecebida: inc.quantidadeRecebida,
        quantidadeComDefeito: inc.quantidadeComDefeito,
        descricaoNaoConformidade: createRncDto.descricaoNaoConformidade,
        reincidente: createRncDto.reincidente,
        rncAnteriorId: createRncDto.rncAnteriorId,
        status: 'RNC enviada',
        prazoInicio,
        incId: inc.id,
        fornecedorId: inc.fornecedorId,
        criadoPorId: userId,
      },
      include: {
        inc: true,
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        rncAnterior: true,
      },
    });

    // Atualizar status da INC para "RNC enviada"
    await this.prisma.inc.update({
      where: { id: inc.id },
      data: { status: 'RNC enviada' },
    });

    // Gerar PDF da RNC
    const pdfPath = await this.generatePdf(rnc.id);

    // Atualizar RNC com o caminho do PDF
    const rncAtualizada = await this.prisma.rnc.update({
      where: { id: rnc.id },
      data: { pdfPath },
      include: {
        inc: true,
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        rncAnterior: true,
      },
    });

    return rncAtualizada;
  }

  /**
   * Lista todas as RNCs com filtros opcionais
   */
  async findAll(filters: FilterRncDto) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fornecedorId) {
      where.fornecedorId = filters.fornecedorId;
    }

    if (filters.ano) {
      where.ano = filters.ano;
    }

    if (filters.reincidente !== undefined) {
      where.reincidente = filters.reincidente;
    }

    return this.prisma.rnc.findMany({
      where,
      include: {
        inc: true,
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        rncAnterior: {
          select: {
            id: true,
            numero: true,
            data: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca uma RNC específica pelo ID
   */
  async findOne(id: string) {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id },
      include: {
        inc: {
          include: {
            fotos: true,
          },
        },
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        rncAnterior: true,
        rncsFilhas: {
          select: {
            id: true,
            numero: true,
            data: true,
            status: true,
          },
        },
      },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    return rnc;
  }

  /**
   * Atualiza uma RNC existente
   */
  async update(id: string, updateRncDto: UpdateRncDto) {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    const dataToUpdate: any = {};

    if (updateRncDto.descricaoNaoConformidade) {
      dataToUpdate.descricaoNaoConformidade = updateRncDto.descricaoNaoConformidade;
    }

    if (updateRncDto.status) {
      dataToUpdate.status = updateRncDto.status;
    }

    if (updateRncDto.reincidente !== undefined) {
      dataToUpdate.reincidente = updateRncDto.reincidente;
    }

    if (updateRncDto.rncAnteriorId !== undefined) {
      // Se mudou a RNC anterior, validar
      if (updateRncDto.rncAnteriorId) {
        const rncAnterior = await this.prisma.rnc.findUnique({
          where: { id: updateRncDto.rncAnteriorId },
        });

        if (!rncAnterior) {
          throw new NotFoundException('RNC anterior não encontrada');
        }

        if (rncAnterior.fornecedorId !== rnc.fornecedorId) {
          throw new BadRequestException(
            'A RNC anterior deve ser do mesmo fornecedor',
          );
        }
      }

      dataToUpdate.rncAnteriorId = updateRncDto.rncAnteriorId;
    }

    return this.prisma.rnc.update({
      where: { id },
      data: dataToUpdate,
      include: {
        inc: true,
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        rncAnterior: true,
      },
    });
  }

  /**
   * Remove uma RNC e seu PDF
   */
  async remove(id: string) {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id },
      include: {
        inc: true,
      },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    // Deletar PDFs se existirem
    if (rnc.pdfPath) {
      this.deleteFile(rnc.pdfPath);
    }
    if (rnc.planoAcaoPdfPath) {
      this.deleteFile(rnc.planoAcaoPdfPath);
    }

    // Reverter status da INC para "Em análise"
    await this.prisma.inc.update({
      where: { id: rnc.incId },
      data: { status: 'Em análise' },
    });

    await this.prisma.rnc.delete({
      where: { id },
    });

    return { message: 'RNC deletada com sucesso' };
  }

  /**
   * Aprova uma INC por concessão (muda status para "Aprovado por concessão")
   */
  async aprovarPorConcessao(dto: AprovarPorConcessaoDto, userId: string) {
    const inc = await this.prisma.inc.findUnique({
      where: { id: dto.incId },
    });

    if (!inc) {
      throw new NotFoundException('INC não encontrada');
    }

    if (inc.status !== 'Em análise') {
      throw new BadRequestException(
        'Apenas INCs com status "Em análise" podem ser aprovadas por concessão',
      );
    }

    return this.prisma.inc.update({
      where: { id: dto.incId },
      data: {
        status: 'Aprovado por concessão',
      },
      include: {
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Busca RNCs anteriores de um fornecedor (para dropdown de reincidência)
   */
  async findRncsByFornecedor(fornecedorId: string, ano?: number) {
    const where: any = {
      fornecedorId,
    };

    if (ano) {
      where.ano = ano;
    }

    return this.prisma.rnc.findMany({
      where,
      select: {
        id: true,
        numero: true,
        data: true,
        status: true,
        descricaoNaoConformidade: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Gera o PDF da RNC
   */
  async generatePdf(rncId: string): Promise<string> {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id: rncId },
      include: {
        inc: true,
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        rncAnterior: true,
      },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    if (!rnc.fornecedor) {
      throw new Error('Dados do fornecedor não encontrados');
    }

    if (!rnc.criadoPor) {
      throw new Error('Dados do criador não encontrados');
    }

    // Criar nome do arquivo
    const filename = `rnc-${rnc.numero.replace(/[:\/]/g, '-')}-${Date.now()}.pdf`;
    const filepath = path.join(this.uploadPath, filename);

    // Criar documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    // Stream para arquivo
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // HEADER
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('RELATÓRIO DE NÃO CONFORMIDADE', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(16)
      .text(rnc.numero, { align: 'center' })
      .moveDown(1);

    // Dados da RNC
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Dados da RNC', { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Data: ${new Date(rnc.data).toLocaleDateString('pt-BR')}`, {
        continued: true,
      })
      .text(`     Status: ${rnc.status}`)
      .text(`Responsável: ${rnc.criadoPor.nome}`)
      .moveDown(1);

    // Dados do Fornecedor
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Dados do Fornecedor', { underline: true })
      .moveDown(0.3);

    const cnpjFormatado = rnc.fornecedor.cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`CNPJ: ${cnpjFormatado}`)
      .text(`Razão Social: ${rnc.fornecedor.razaoSocial}`)
      .text(`Código Logix: ${rnc.fornecedor.codigoLogix}`)
      .moveDown(1);

    // Dados da INC Original
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Dados da INC Original', { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`AR: ${rnc.ar}`)
      .text(`NF-e: ${rnc.nfeNumero}`)
      .text(`Unidade de Medida: ${rnc.um}`)
      .text(`Quantidade Recebida: ${rnc.quantidadeRecebida}`)
      .text(`Quantidade com Defeito: ${rnc.quantidadeComDefeito}`)
      .moveDown(1);

    // Descrição da Não Conformidade
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Descrição da Não Conformidade', { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(rnc.descricaoNaoConformidade || 'Não informada', {
        align: 'justify',
      })
      .moveDown(1);

    // Reincidência
    if (rnc.reincidente && rnc.rncAnterior) {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('red')
        .text('⚠️ REINCIDÊNCIA', { underline: true })
        .moveDown(0.3);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('black')
        .text(`RNC Anterior: ${rnc.rncAnterior.numero}`)
        .text(
          `Data da RNC Anterior: ${new Date(rnc.rncAnterior.data).toLocaleDateString('pt-BR')}`,
        )
        .moveDown(1);
    }

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('gray')
      .text(
        `Documento gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`,
        50,
        doc.page.height - 30,
        { align: 'center' },
      );

    // Finalizar PDF
    doc.end();

    // Aguardar escrita do arquivo
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    return filename;
  }

  /**
   * Aceita o plano de ação de uma RNC
   */
  async aceitarPlanoAcao(
    id: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    if (rnc.status !== 'RNC enviada') {
      throw new BadRequestException(
        'Apenas RNCs com status "RNC enviada" podem ter plano de ação aceito',
      );
    }

    // Salvar o arquivo do plano de ação
    const filename = file.filename;

    // Calcular prazo (data atual até 7 dias)
    const prazoInicio = new Date();
    const prazoFim = new Date();
    prazoFim.setDate(prazoFim.getDate() + 7);

    // Atualizar RNC com status "RNC aceita" e PDF do plano de ação
    const rncAtualizada = await this.prisma.rnc.update({
      where: { id },
      data: {
        status: 'RNC aceita',
        planoAcaoPdfPath: filename,
        prazoInicio,
      },
      include: {
        inc: true,
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Criar registro no histórico
    await this.prisma.rncHistorico.create({
      data: {
        rncId: id,
        tipo: 'ACEITE',
        pdfPath: filename,
        prazoInicio,
        prazoFim,
        criadoPorId: userId,
      },
    });

    return rncAtualizada;
  }

  /**
   * Recusa o plano de ação de uma RNC
   */
  async recusarPlanoAcao(
    id: string,
    file: Express.Multer.File,
    dto: RecusarPlanoAcaoDto,
    userId: string,
  ) {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    if (rnc.status !== 'RNC enviada') {
      throw new BadRequestException(
        'Apenas RNCs com status "RNC enviada" podem ter plano de ação recusado',
      );
    }

    // Salvar o arquivo do plano de ação
    const filename = file.filename;

    // Calcular novo prazo (data atual até 7 dias)
    const prazoInicio = new Date();
    const prazoFim = new Date();
    prazoFim.setDate(prazoFim.getDate() + 7);

    // Atualizar apenas o prazo (status mantém "RNC enviada")
    const rncAtualizada = await this.prisma.rnc.update({
      where: { id },
      data: {
        prazoInicio,
      },
      include: {
        inc: true,
        fornecedor: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Criar registro no histórico
    await this.prisma.rncHistorico.create({
      data: {
        rncId: id,
        tipo: 'RECUSA',
        pdfPath: filename,
        justificativa: dto.justificativa,
        prazoInicio,
        prazoFim,
        criadoPorId: userId,
      },
    });

    return rncAtualizada;
  }

  /**
   * Busca o histórico de uma RNC
   */
  async getHistorico(id: string) {
    const rnc = await this.prisma.rnc.findUnique({
      where: { id },
    });

    if (!rnc) {
      throw new NotFoundException('RNC não encontrada');
    }

    return this.prisma.rncHistorico.findMany({
      where: {
        rncId: id,
      },
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca um item específico do histórico
   */
  async findHistoricoItem(historicoId: string) {
    const historico = await this.prisma.rncHistorico.findUnique({
      where: { id: historicoId },
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!historico) {
      throw new NotFoundException('Item do histórico não encontrado');
    }

    return historico;
  }

  /**
   * Calcula os dias restantes do prazo atual
   */
  calcularDiasRestantes(prazoInicio: Date): number {
    if (!prazoInicio) {
      return 0;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicio = new Date(prazoInicio);
    inicio.setHours(0, 0, 0, 0);

    const prazoFim = new Date(inicio);
    prazoFim.setDate(prazoFim.getDate() + 7);

    const diffTime = prazoFim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Remove arquivo físico do sistema
   */
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
}
