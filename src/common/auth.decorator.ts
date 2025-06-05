import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Role } from 'generated/prisma';

export const Auth = (roles: Role[]) => SetMetadata('roles', roles);

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }
);
