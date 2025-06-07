import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Auth, AuthUser } from 'src/common/auth.decorator';
import { RolesGuard } from 'src/common/roles.guard';
import { BuildingService } from './building.service';
import { User } from 'generated/prisma';
import { AddItemBuildingRequestDto } from './buildingDto';

@Controller('api/building')
export class BuildingController {
  constructor(
    private buildingService: BuildingService
  ) { }
  @Get(':id?')
  async getAll(@Param('id') id?: string) {
    return this.buildingService.getAll(id);
  }

  @Post()
  @Auth(['ADMIN', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async create(
    @AuthUser() user: User,
    @Body() body?: AddItemBuildingRequestDto
  ) {
    return this.buildingService.create(user, body);
  }
} 