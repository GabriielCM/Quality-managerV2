import {
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRncDto {
  @IsUUID()
  incId: string;

  @IsString()
  descricaoNaoConformidade: string;

  @IsBoolean()
  reincidente: boolean;

  @IsOptional()
  @IsUUID()
  rncAnteriorId?: string;

  @IsOptional()
  @IsDateString()
  data?: string;
}

export class UpdateRncDto extends PartialType(CreateRncDto) {
  @IsOptional()
  @IsString()
  @IsIn(['RNC enviada', 'Aguardando resposta', 'Em análise', 'Concluída'])
  status?: string;
}

export class FilterRncDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  fornecedorId?: string;

  @IsOptional()
  @IsInt()
  ano?: number;

  @IsOptional()
  @IsBoolean()
  reincidente?: boolean;
}

export class AprovarPorConcessaoDto {
  @IsUUID()
  incId: string;
}
