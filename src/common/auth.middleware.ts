import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  // UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { tokenVerify } from 'src/auth/AuthDTO';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService
  ) { }

  async use(req: any, res: any, next: (error?: any) => void) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];

    if (type === 'Bearer' && token) {
      try {
        const decoded: tokenVerify = this.jwtService.verify(token);
        if (decoded && decoded.email) {
          let user = await this.prismaService.user.findUnique({
            where: { email: decoded.email },
          });
          if (user) {
            user = await this.prismaService.user.update({
              where: { id: user.id },
              data: { lastActive: new Date() },
            });
            req.user = user;
          }
        }
      } catch (error) {
        console.error('Token verification failed', error);
        throw new HttpException('Invalid token or expired', HttpStatus.UNAUTHORIZED);
      }
    }

    next();
  }
}
