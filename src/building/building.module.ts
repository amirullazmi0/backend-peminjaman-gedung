import { Module } from '@nestjs/common';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BuildingController],
  providers: [BuildingService, PrismaService]
})
export class BuildingModule { }
