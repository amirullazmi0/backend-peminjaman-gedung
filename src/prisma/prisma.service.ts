import {
  // Global,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from 'generated/prisma';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }
  onModuleInit() {
    this.$on('info', (e) => {
      console.log();
      this.logger.info(e);
      console.log();
    });
    this.$on('warn', (e) => {
      console.log();
      this.logger.warn(e);
      console.log();
    });
    this.$on('error', (e) => {
      console.log();
      this.logger.error(e);
      console.log();
    });
    this.$on('query', (e) => {
      console.log();
      this.logger.info(e);
      console.log();
    });
  }
}
