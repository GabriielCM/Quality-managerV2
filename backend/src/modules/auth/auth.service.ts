import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha);

    if (!isPasswordValid) {
      return null;
    }

    const { senha, ...result } = user;
    return result;
  }

  async login(user: any) {
    const permissions = await this.usersService.getUserPermissions(user.id);

    const payload = {
      email: user.email,
      sub: user.id,
      nome: user.nome,
      permissions: permissions.map((p) => p.permission.code),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        permissions: permissions.map((p) => ({
          code: p.permission.code,
          name: p.permission.name,
          module: p.permission.module,
        })),
      },
    };
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshTokenSecret = this.configService.get('JWT_REFRESH_SECRET');
    const refreshTokenExpiration = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');

    const payload = { sub: userId };
    const token = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpiration,
    });

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    // Salvar no banco
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const refreshTokenSecret = this.configService.get('JWT_REFRESH_SECRET');

      // Verificar se o token é válido
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshTokenSecret,
      });

      // Verificar se o refresh token existe no banco e não está expirado
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      // Gerar novo access token
      const user = storedToken.user;
      const permissions = await this.usersService.getUserPermissions(user.id);

      const newPayload = {
        email: user.email,
        sub: user.id,
        nome: user.nome,
        permissions: permissions.map((p) => p.permission.code),
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: string, refreshToken: string) {
    // Remover refresh token do banco
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'Logout realizado com sucesso' };
  }

  async revokeAllRefreshTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
