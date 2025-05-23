import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class TokenCleanupService {
  private readonly prisma = new PrismaClient();

  @Cron('0 * * * *') // Jalankan setiap satu jam
  async handleCron() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    await this.prisma.user.updateMany({
      where: {
        lastActive: {
          lt: oneDayAgo,
        },
        accessToken: {
          not: null,
        },
      },
      data: {
        accessToken: null,
      },
    });

    console.log();
    console.log(`\x1b[33mCleanUpAccessToken\x1b[0m \x1b[32m[UPDATE]\x1b[0m`);
    console.log();
  }
}
