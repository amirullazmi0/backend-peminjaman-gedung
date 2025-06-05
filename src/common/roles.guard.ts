import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from 'generated/prisma';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
