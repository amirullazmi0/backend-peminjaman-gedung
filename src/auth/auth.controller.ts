import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { authActivationRequest, authActivationTokenRequest, authLoginRequestDto, authRegisterRequestDto } from './AuthDTO';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) { }
  @Post('login')
  async Login(
    @Body() req: authLoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(req, res)
  }

  @Post('register')
  async Register(
    @Body() body: authRegisterRequestDto
  ) {
    return this.authService.register(body)
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshToken(req, res);
  }

  @Post('forget-password')
  async ForgetPassword() {

  }

  @Post('activation-token-request')
  async ActivationTokenRequest(
    @Body() body: authActivationTokenRequest
  ) {
    return this.authService.activationTokenRequest(body)
  }

  @Post('activation')
  async Activation(
    @Body() body: authActivationRequest
  ) {
    return this.authService.activationUser(body)
  }
}
