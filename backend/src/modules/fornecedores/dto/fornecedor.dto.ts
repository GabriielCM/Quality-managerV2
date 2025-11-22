import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, Length, IsOptional } from 'class-validator';

export class CreateFornecedorDto {
  @ApiProperty({
    example: '47747955000170',
    description: 'CNPJ sem máscara (apenas números)'
  })
  @IsString()
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @Length(14, 14, { message: 'CNPJ deve ter 14 dígitos' })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas números' })
  cnpj: string;

  @ApiProperty({
    example: 'Empresa Fornecedora Ltda',
    description: 'Razão Social do fornecedor'
  })
  @IsString()
  @IsNotEmpty({ message: 'Razão Social é obrigatória' })
  razaoSocial: string;

  @ApiProperty({
    example: 'FOR001',
    description: 'Código do fornecedor no sistema Logix'
  })
  @IsString()
  @IsNotEmpty({ message: 'Código Logix é obrigatório' })
  codigoLogix: string;
}

export class UpdateFornecedorDto extends PartialType(CreateFornecedorDto) {}

export class FilterFornecedorDto {
  @ApiProperty({ required: false, description: 'Buscar por CNPJ (parcial)' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ required: false, description: 'Buscar por Razão Social (parcial)' })
  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @ApiProperty({ required: false, description: 'Buscar por Código Logix (parcial)' })
  @IsOptional()
  @IsString()
  codigoLogix?: string;
}
