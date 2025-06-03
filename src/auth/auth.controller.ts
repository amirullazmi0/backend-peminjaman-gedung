import { Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { authLoginRequestDto } from './AuthDTO';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) { }
  @Post('login')
  async Login(req: authLoginRequestDto, res: Response) {
    return this.authService.login(req, res)
  }

  @Post('register')
  async Register() {

  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Post('forget-password')
  async ForgetPassword() {

  }
}
