import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsIn,
  IsEnum,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export enum DevolucaoStatus {
  RNC_ACEITA = 'RNC_ACEITA',
  DEVOLUCAO_SOLICITADA = 'DEVOLUCAO_SOLICITADA',
  NFE_EMITIDA = 'NFE_EMITIDA',
  DEVOLUCAO_COLETADA = 'DEVOLUCAO_COLETADA',
  DEVOLUCAO_RECEBIDA = 'DEVOLUCAO_RECEBIDA',
  FINALIZADO = 'FINALIZADO',
}

export class CreateDevolucaoDto {
  @ApiProperty({ description: 'ID da RNC com status "RNC aceita"' })
  @IsUUID()
  rncId: string;

  @ApiProperty({ description: 'Quantidade total para devolução', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantidadeTotal: number;

  @ApiProperty({ description: 'Peso em Kg', minimum: 0 })
  @IsNumber()
  @Min(0)
  pesoKg: number;

  @ApiProperty({ description: 'Motivo da devolução' })
  @IsString()
  motivo: string;

  @ApiProperty({ description: 'Transportadora responsável' })
  @IsString()
  transportadora: string;

  @ApiProperty({ description: 'Tipo de frete', enum: ['FOB', 'CIF'] })
  @IsString()
  @IsIn(['FOB', 'CIF'])
  frete: string;

  @ApiProperty({ description: 'Meio de compensação' })
  @IsString()
  meioCompensacao: string;
}

export class EmitirNfeDto {
  @ApiProperty({ description: 'Número da NF-e de devolução' })
  @IsString()
  nfeNumero: string;
}

export class FilterDevolucaoDto {
  @ApiProperty({ enum: DevolucaoStatus, required: false })
  @IsOptional()
  @IsEnum(DevolucaoStatus)
  status?: DevolucaoStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  rncId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fornecedorId?: string;
}

export class UpdateDevolucaoDto extends PartialType(CreateDevolucaoDto) {}
