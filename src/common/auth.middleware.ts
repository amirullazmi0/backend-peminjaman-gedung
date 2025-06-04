import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { tokenVerify } from 'src/auth/AuthDTO';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
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
