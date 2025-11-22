import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FornecedoresService } from './fornecedores.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('FornecedoresService', () => {
  let service: FornecedoresService;
  let prisma: PrismaService;

  const mockPrismaService = {
    fornecedor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockFornecedor = {
    id: '1',
    cnpj: '47747955000170',
    razaoSocial: 'Empresa Teste Ltda',
    codigoLogix: 'FOR001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FornecedoresService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FornecedoresService>(FornecedoresService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new fornecedor', async () => {
      const createDto = {
        cnpj: '47747955000170',
        razaoSocial: 'Empresa Teste Ltda',
        codigoLogix: 'FOR001',
      };

      mockPrismaService.fornecedor.findUnique.mockResolvedValue(null);
      mockPrismaService.fornecedor.create.mockResolvedValue(mockFornecedor);

      const result = await service.create(createDto);

      expect(result).toEqual(mockFornecedor);
      expect(prisma.fornecedor.findUnique).toHaveBeenCalledWith({
        where: { cnpj: createDto.cnpj },
      });
      expect(prisma.fornecedor.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if CNPJ already exists', async () => {
      const createDto = {
        cnpj: '47747955000170',
        razaoSocial: 'Empresa Teste Ltda',
        codigoLogix: 'FOR001',
      };

      mockPrismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.fornecedor.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of fornecedores', async () => {
      const fornecedores = [mockFornecedor];
      mockPrismaService.fornecedor.findMany.mockResolvedValue(fornecedores);

      const result = await service.findAll();

      expect(result).toEqual(fornecedores);
      expect(prisma.fornecedor.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by CNPJ', async () => {
      const filters = { cnpj: '477479' };
      mockPrismaService.fornecedor.findMany.mockResolvedValue([mockFornecedor]);

      await service.findAll(filters);

      expect(prisma.fornecedor.findMany).toHaveBeenCalledWith({
        where: { cnpj: { contains: '477479' } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by razaoSocial', async () => {
      const filters = { razaoSocial: 'Teste' };
      mockPrismaService.fornecedor.findMany.mockResolvedValue([mockFornecedor]);

      await service.findAll(filters);

      expect(prisma.fornecedor.findMany).toHaveBeenCalledWith({
        where: { razaoSocial: { contains: 'Teste', mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a fornecedor by id', async () => {
      mockPrismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);

      const result = await service.findOne('1');

      expect(result).toEqual(mockFornecedor);
      expect(prisma.fornecedor.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if fornecedor not found', async () => {
      mockPrismaService.fornecedor.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCnpj', () => {
    it('should return a fornecedor by CNPJ', async () => {
      mockPrismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);

      const result = await service.findByCnpj('47747955000170');

      expect(result).toEqual(mockFornecedor);
      expect(prisma.fornecedor.findUnique).toHaveBeenCalledWith({
        where: { cnpj: '47747955000170' },
      });
    });
  });

  describe('update', () => {
    it('should update a fornecedor', async () => {
      const updateDto = { razaoSocial: 'Empresa Atualizada Ltda' };
      const updatedFornecedor = { ...mockFornecedor, ...updateDto };

      mockPrismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);
      mockPrismaService.fornecedor.update.mockResolvedValue(updatedFornecedor);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedFornecedor);
      expect(prisma.fornecedor.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if fornecedor not found', async () => {
      mockPrismaService.fornecedor.findUnique.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
      expect(prisma.fornecedor.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updating CNPJ to existing one', async () => {
      const updateDto = { cnpj: '99999999999999' };
      const otherFornecedor = { ...mockFornecedor, id: '2', cnpj: '99999999999999' };

      mockPrismaService.fornecedor.findUnique
        .mockResolvedValueOnce(mockFornecedor) // findOne check
        .mockResolvedValueOnce(otherFornecedor); // CNPJ exists check

      await expect(service.update('1', updateDto)).rejects.toThrow(ConflictException);
      expect(prisma.fornecedor.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a fornecedor', async () => {
      mockPrismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);
      mockPrismaService.fornecedor.delete.mockResolvedValue(mockFornecedor);

      const result = await service.remove('1');

      expect(result).toEqual({ message: 'Fornecedor removido com sucesso' });
      expect(prisma.fornecedor.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if fornecedor not found', async () => {
      mockPrismaService.fornecedor.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(prisma.fornecedor.delete).not.toHaveBeenCalled();
    });
  });
});
