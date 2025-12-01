import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsIn,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  Min,
  ValidateIf,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export enum ConsertoStatus {
  RNC_ACEITA = 'RNC_ACEITA',
  CONSERTO_SOLICITADA = 'CONSERTO_SOLICITADA',
  NFE_EMITIDA = 'NFE_EMITIDA',
  CONSERTO_COLETADO = 'CONSERTO_COLETADO',
  CONSERTO_RECEBIDO = 'CONSERTO_RECEBIDO',
  MATERIAL_RETORNADO = 'MATERIAL_RETORNADO',
  FINALIZADO = 'FINALIZADO',
  REJEITADO = 'REJEITADO',
}

export class CreateConsertoDto {
  @ApiProperty({ description: 'ID da RNC com status "RNC aceita"' })
  @IsUUID()
  rncId: string;

  @ApiProperty({ description: 'Quantidade total para conserto', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantidadeTotal: number;

  @ApiProperty({ description: 'Peso em Kg', minimum: 0 })
  @IsNumber()
  @Min(0)
  pesoKg: number;

  @ApiProperty({ description: 'Motivo do conserto' })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({ description: 'Tipo de frete', enum: ['FOB', 'CIF'] })
  @IsString()
  @IsIn(['FOB', 'CIF'])
  frete: string;

  @ApiProperty({
    description: 'Transportadora responsável (obrigatória se frete = FOB)',
    required: false,
  })
  @ValidateIf((o) => o.frete === 'FOB')
  @IsString()
  @IsNotEmpty()
  transportadora?: string;

  @ApiProperty({
    description: 'Conserto em garantia (campo informativo)',
    default: false,
  })
  @IsBoolean()
  consertoEmGarantia: boolean;
}

export class EmitirNfeConsertoDto {
  @ApiProperty({ description: 'Número da NF-e de conserto' })
  @IsString()
  @IsNotEmpty()
  nfeNumero: string;
}

export class ConfirmarRetornoDto {
  @ApiProperty({ description: 'Número da NF-e de retorno do material' })
  @IsString()
  @IsNotEmpty()
  nfeRetornoNumero: string;
}

export class AprovarInspecaoDto {
  @ApiProperty({
    description: 'Descrição da inspeção (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  inspecaoDescricao?: string;
}

export class RejeitarInspecaoDto {
  @ApiProperty({
    description: 'Descrição da rejeição (obrigatória)',
  })
  @IsString()
  @IsNotEmpty()
  inspecaoDescricao: string;
}

export class FilterConsertoDto {
  @ApiProperty({ enum: ConsertoStatus, required: false })
  @IsOptional()
  @IsEnum(ConsertoStatus)
  status?: ConsertoStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  rncId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fornecedorId?: string;
}

export class UpdateConsertoDto extends PartialType(CreateConsertoDto) {}
