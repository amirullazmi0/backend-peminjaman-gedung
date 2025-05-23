import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { BuildingModule } from './building/building.module';
import { UserModule } from './user/user.module';
import { RentBuildingModule } from './rent-building/rent-building.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    AuthModule,
    BuildingModule,
    UserModule,
    RentBuildingModule,
    CommonModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
