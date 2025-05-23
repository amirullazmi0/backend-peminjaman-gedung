import { Module } from '@nestjs/common';
import { RentBuildingController } from './rent-building.controller';
import { RentBuildingService } from './rent-building.service';

@Module({
  controllers: [RentBuildingController],
  providers: [RentBuildingService]
})
export class RentBuildingModule {}
