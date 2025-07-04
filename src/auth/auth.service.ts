import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { authActivationRequest, authActivationTokenRequest, authActivationUserResponse, authForgetPasswordDto, authForgetPasswordResponseDto, authLoginRequestDto, authLoginResponse, authNewPasswordRequestDto, authRegisterRequestDto, authRegisterResponse, tokenVerify } from './AuthDTO';
import { WebResponse } from 'src/DTO/globalsResponse';
import { authenticated, authLoginFailed, authLoginSuccess, emailIsUnique, emailPassworWrong, invalidToken, phoneIsUnique, registerSuccess, tokenExpired, unAuthenticated, updateNewPasswordSuccess, urlNewPasswordSuccess, userActivated, userNotActive, userNotFound } from 'src/DTO/messages';
import { Role, User } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { SendEmailService } from 'src/send-email/send-email.service';
import { formatIndonesianDate } from 'src/utils/formatDate';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private sendEmailService: SendEmailService
  ) { }

  async login(req: authLoginRequestDto, res: Response): Promise<WebResponse<authLoginResponse>> {
    const user = await this.findUserByEmail(req.email);
    if (!user) throw new BadRequestException('Email tidak ditemukan');

    const isPasswordValid = await bcrypt.compare(req.password, user.password);
    if (!isPasswordValid) throw new BadRequestException(emailPassworWrong);

    if (!user.isActive) {
      return { success: false, message: userNotActive };
    }

    const accessToken = this.jwtService.sign(
      { email: user.email, role: user.role },
      { expiresIn: '1h' }
    );

    const refreshToken = this.jwtService.sign(
      { email: user.email, role: user.role },
      { expiresIn: '7d' }
    );

    await this.prismaService.user.update({
      where: { email: user.email },
      data: { refreshToken: refreshToken },
    });

    res.cookie('access-token', accessToken, {
      httpOnly: true,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
    });

    return {
      success: true,
      message: authLoginSuccess,
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        accessToken: accessToken,
      }
    };
  }

  async register(body: authRegisterRequestDto): Promise<WebResponse<authRegisterResponse>> {
    let user = await this.findUserByEmail(body.email)

    if (user) {
      throw new BadRequestException(emailIsUnique)
    }

    const userByPhone = await this.findUserByPhone('62' + body.phone)

    if (userByPhone) {
      throw new BadRequestException(phoneIsUnique)
    }

    const bcryptPassword = await bcrypt.hash(body.password, 10);

    user = await this.prismaService.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: '62' + body.phone,
        role: body.role,
        password: bcryptPassword
      }
    })

    await this.prismaService.userAddress.create({
      data: {
        userId: user.id
      }
    })

    const activationToken = await this.jwtService.sign(
      {
        email: user.email,
        role: user.role,
        type: 'activation'
      },
      { expiresIn: '1h' }
    );

    const ORIGIN_FE = process.env.ORIGIN_FE
    const oneHourSoon = new Date(Date.now() + 60 * 60 * 1000);

    await this.sendEmailService.sendEmail({
      subject: 'Aktivasi Akun',
      type: 'account-activation',
      to: user.email,
      context: {
        name: user.name,
        email: user.email,
        url: `${ORIGIN_FE}/auth/${activationToken}/activation-user`,
        date: formatIndonesianDate(oneHourSoon)
      }
    })

    return {
      success: true,
      message: registerSuccess,
      data: {
        name: user.name,
        email: user.email
      }
    }
  }

  async activationTokenRequest(body: authActivationTokenRequest): Promise<WebResponse<any>> {

    const user = await this.findUserByEmail(body.email)

    if (!user) {
      throw new BadRequestException(userNotFound)
    }
    const activationToken = await this.jwtService.sign(
      {
        email: user.email,
        role: user.role,
        type: 'activation'
      },
      { expiresIn: '1h' }
    );

    const ORIGIN_FE = process.env.ORIGIN_FE
    const oneHourSoon = new Date(Date.now() + 60 * 60 * 1000);

    await this.sendEmailService.sendEmail({
      subject: 'Aktivasi Akun',
      type: 'account-activation',
      to: user.email,
      context: {
        name: user.name,
        email: user.email,
        url: `${ORIGIN_FE}/auth/${activationToken}/activation-user`,
        date: formatIndonesianDate(oneHourSoon)
      }
    })

    return {
      message: 'activation request sent successfully',
      success: true,
    }
  }

  async activationUser(body: authActivationRequest): Promise<WebResponse<authActivationUserResponse>> {
    try {
      const token = body.token

      const data: tokenVerify = await this.jwtService.verify(token)

      let user = await this.findUserByEmail(data.email)

      user = await this.prismaService.user.update({
        where: {
          email: user.email
        },
        data: {
          isActive: true,
          emailVerified: new Date
        }
      })

      return {
        message: userActivated,
        success: true,
        data: {
          active: user.isActive,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(tokenExpired)
      } else if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException(invalidToken)
      } else {
        throw new BadRequestException(error.message)
      }
    }
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token tidak ditemukan');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }

      const newAccessToken = this.jwtService.sign(
        { email: user.email, role: user.role },
        { expiresIn: '1h' }
      );

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

  async forgetPassword(body: authForgetPasswordDto): Promise<WebResponse<authForgetPasswordResponseDto>> {
    const user = await this.findUserByEmail(body.email);
    if (!user) throw new BadRequestException('Email tidak ditemukan');
    const ORIGIN_FE = process.env.ORIGIN_FE
    const oneHourSoon = new Date(Date.now() + 60 * 60 * 1000);

    const forgetPasswordToken = await this.jwtService.sign(
      {
        email: user.email,
        role: user.role,
        type: 'forget-password'
      },
      { expiresIn: '1h' }
    );

    await this.sendEmailService.sendEmail({
      subject: 'Reset Password Akun',
      type: 'forget-password',
      to: user.email,
      context: {
        name: user.name,
        email: user.email,
        url: `${ORIGIN_FE}/auth/forget-password/${forgetPasswordToken}/new-password`,
        date: formatIndonesianDate(oneHourSoon)
      }
    })

    return {
      success: true,
      message: urlNewPasswordSuccess
    }
  }

  async newPassword(body: authNewPasswordRequestDto): Promise<WebResponse<any>> {
    try {
      const token = body.token

      const data: tokenVerify = await this.jwtService.verify(token)

      let user = await this.findUserByEmail(data.email)

      const bcryptPassword = await bcrypt.hash(body.password, 10);

      user = await this.prismaService.user.update({
        where: {
          email: user.email
        },
        data: {
          password: bcryptPassword
        }
      })

      return {
        message: updateNewPasswordSuccess,
        success: true,
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          message: tokenExpired,
          success: false,
          data: null,
        };
      } else if (error.name === 'JsonWebTokenError') {
        return {
          message: invalidToken,
          success: false,
          data: null,
        };
      } else {
        return {
          message: 'An error occurred during token verification',
          success: false,
          data: null,
        };
      }
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

  async findUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id
      }
    })

    if (user) {
      return user
    } else {
      return undefined
    }
  }

  async findUserByPhone(phone: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        phone: phone
      }
    })

    if (user) {
      return user
    } else {
      return undefined
    }
  }

  async checkAuth(req: Request): Promise<WebResponse<{
    email: string,
    role: Role
  }>> {
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
      return {
        success: false,
        message: 'Authorization header missing',
        data: null,
      };
    }
    const token = authorizationHeader.split(' ')[1]
    if (!token) {
      return {
        success: false,
        message: unAuthenticated
      }
    }
    const data: tokenVerify = await this.jwtService.verify(token)
    const user = await this.findUserByEmail(data.email)

    if (user) {
      return {
        success: true,
        message: authenticated,
        data: {
          email: user.email,
          role: user.role
        }
      }
    } else {
      return {
        success: false,
        message: unAuthenticated
      }
    }
  }
}
