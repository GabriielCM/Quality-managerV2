import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'João Silva', required: false })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({ example: 'joao@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'novaSenha123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  senha?: string;
}

export class AssignPermissionsDto {
  @ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsNotEmpty()
  permissionIds: string[];
}
