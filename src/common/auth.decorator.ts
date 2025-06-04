import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Role, User } from 'generated/prisma';

const AuthRole = (roles: Role[]) => createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (user) {
      if (!roles.includes(user.role)) {
        throw new HttpException('Access Denied: Insufficient Role', HttpStatus.FORBIDDEN);
      }
      return user;
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  },
);
export const Auth = AuthRole(['ADMIN', 'SUPERADMIN', 'USER']);
