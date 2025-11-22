import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncDto {
  @ApiProperty({ example: 12345 })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  ar: number;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  nfeNumero: string;

  @ApiProperty({ example: 'KG', description: 'Unidade de medida: UN, KG, M, etc' })
  @IsString()
  @IsNotEmpty()
  um: string;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quantidadeRecebida: number;

  @ApiProperty({ example: 5.2 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quantidadeComDefeito: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  nfeFile?: any;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, required: false })
  fotos?: any[];
}

export class UpdateIncDto extends PartialType(CreateIncDto) {
  @ApiProperty({ example: 'Aprovado', required: false, enum: ['Em análise', 'Aprovado', 'Rejeitado'] })
  @IsString()
  @IsOptional()
  @IsIn(['Em análise', 'Aprovado', 'Rejeitado'])
  status?: string;
}

export class FilterIncDto {
  @ApiProperty({ required: false, enum: ['Em análise', 'Aprovado', 'Rejeitado'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  ar?: number;

  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsString()
  dataInicio?: string;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsString()
  dataFim?: string;
}
