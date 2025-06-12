import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from './auth.middleware'
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenCleanupService } from 'src/auth/token-cleanup.service';
import { AttachmentService } from 'src/attachment/attachment.service';


@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    JwtModule.register({
      global: true,
      secret: 'mysecret-rent-building-2025',
    }),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  providers: [PrismaService, TokenCleanupService, AttachmentService],
  exports: [PrismaService, TokenCleanupService, AttachmentService],
})

export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('api/*');
  }
}

// export class CommonModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(AuthMiddleware)
//       .forRoutes(
//         { path: 'api/building', method: RequestMethod.GET },
//         { path: 'api/user/*', method: RequestMethod.POST },
//       );
//   }
// }
