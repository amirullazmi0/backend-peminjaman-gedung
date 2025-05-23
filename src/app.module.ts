import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BuildingModule } from './building/building.module';
import { UserModule } from './user/user.module';
import { RentBuildingModule } from './rent-building/rent-building.module';

@Module({
  imports: [AuthModule, BuildingModule, UserModule, RentBuildingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
