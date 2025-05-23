import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
  //   Next,
} from '@nestjs/common';
import { User } from 'generated/prisma';


export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user: User = request.user;

    if (user) {
      return user;
    } else {
      throw new HttpException('unAuthorized', HttpStatus.UNAUTHORIZED);
    }
  },
);
