import { Body, Controller, Get, HttpStatus, ParseFilePipeBuilder, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { RentBuildingService } from './rent-building.service';
import { Auth, AuthUser } from 'src/common/auth.decorator';
import { CreateRentBuildingRequestDto, UpdateRentBuildingRequestDto } from './rent-building.dto';
import { User } from 'generated/prisma';
import { RolesGuard } from 'src/common/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/rent-building')
export class RentBuildingController {

  constructor(
    private rentBuildingService: RentBuildingService
  ) { }

  @Get()
  async getAll(
    @Query('id') id?: string
  ) {
    return this.rentBuildingService.getAll(id);
  }

  @Get('/building')
  async getAllByBuilding(
    @Query('buildingId') buildingId?: string
  ) {
    return this.rentBuildingService.getByBuilding(buildingId);
  }

  @Post()
  @Auth(['USER'])
  @UseGuards(RolesGuard)
  async create(
    @AuthUser() user: User,
    @Body() body?: CreateRentBuildingRequestDto
  ) {
    return this.rentBuildingService.create(body, user);
  }

  @Patch()
  @Auth(['ADMIN'])
  @UseGuards(RolesGuard)
  async update(
    @AuthUser() user: User,
    @Body() body?: UpdateRentBuildingRequestDto
  ) {
    return this.rentBuildingService.update(body, user);
  }

  @Get('/user')
  @Auth(['USER'])
  @UseGuards(RolesGuard)
  async getAllByUser(@AuthUser() user: User) {
    return this.rentBuildingService.getAllByUser(user);
  }

  @Get('/admin')
  @Auth(['ADMIN'])
  @UseGuards(RolesGuard)
  async getAllByAdmin(@AuthUser() user: User) {
    return this.rentBuildingService.getAllByAdmin(user);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @Auth(['ADMIN', 'SUPERADMIN', 'USER'])
  @UseGuards(RolesGuard)
  async saveDocument(
    @AuthUser() user: User,
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.rentBuildingService.saveRentDocument({
      user: user,
      file: file,
    })
  }
}
