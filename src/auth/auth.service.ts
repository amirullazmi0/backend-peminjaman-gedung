import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { authLoginRequestDto, authLoginResponse } from './AuthDTO';
import { WebResponse } from 'src/DTO/globalsResponse';
import { authLoginFailed, authLoginSuccess, emailPassworWrong, userNotActive } from 'src/DTO/messages';
import { User } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) { }

  async login(req: authLoginRequestDto, res: Response): Promise<WebResponse<authLoginResponse>> {
    const user = await this.findUserByEmail(req.email);
    if (!user) throw new BadRequestException('Email tidak ditemukan');

    const isPasswordValid = await bcrypt.compare(req.password, user.password);
    if (!isPasswordValid) throw new BadRequestException(emailPassworWrong);

    if (!user.isActive) {
      return { success: false, message: userNotActive };
    }

    // Generate access token (1 jam)
    const accessToken = this.jwtService.sign(
      { email: user.email, role: user.role },
      { expiresIn: '1h' }
    );

    // Generate refresh token (7 hari)
    const refreshToken = this.jwtService.sign(
      { email: user.email, role: user.role },
      { expiresIn: '7d' }
    );

    // Simpan refresh token ke database
    await this.prismaService.user.update({
      where: { email: user.email },
      data: { refreshToken: refreshToken },
    });

    // Kirim token sebagai httpOnly cookie
    res.cookie('access-token', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 jam
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    return {
      success: true,
      message: authLoginSuccess,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        accessToken: accessToken,
      }
    };
  }

  async refreshToken(req: Request, res: Response) {
    // Ambil refresh token dari cookie
    const refreshToken = req.cookies['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token tidak ditemukan');
    }

    try {
      // Verifikasi refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Cari user dan cek apakah refresh token valid dan sama dengan yang ada di DB
      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }

      // Generate access token baru (1 jam)
      const newAccessToken = this.jwtService.sign(
        { email: user.email, role: user.role },
        { expiresIn: '1h' }
      );

      // Set cookie access token baru
      res.cookie('access-token', newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      return {
        success: true,
        message: 'Access token berhasil diperbarui',
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token tidak valid atau expired');
    }
  }


  async findUserByEmail(email: string): Promise<User> {

    const user = await this.prismaService.user.findUnique({
      where: {
        email: email
      }
    })

    if (user) {
      return user
    } else {
      return undefined
    }
  }

  async findUserById(id: string): Promise<{ user: User }> {

    const user = await this.prismaService.user.findUnique({
      where: {
        id: id
      }
    })

    if (user) {
      return {
        user: user
      }
    } else {
      return {
        user: undefined
      }
    }
  }
}
