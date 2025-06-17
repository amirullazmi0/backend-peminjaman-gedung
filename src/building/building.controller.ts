import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Auth, AuthUser } from 'src/common/auth.decorator';
import { RolesGuard } from 'src/common/roles.guard';
import { BuildingService } from './building.service';
import { User } from 'generated/prisma';
import { AddItemBuildingRequestDto, deleteBuildingRequestDto, updateBuildingRequestDto } from './buildingDto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/building')
export class BuildingController {
  constructor(
    private buildingService: BuildingService
  ) { }
  @Get()
  async getAll(
    @Query('id') id?: string
  ) {
    return this.buildingService.getAll(id); // tanpa ID
  }

  @Get('/admin')
  @Auth(['ADMIN'])
  @UseGuards(RolesGuard)
  async getAllByUser(
    @AuthUser() user: User,
    @Query('id') id?: string
  ) {
    return this.buildingService.getAllByUser(user, id);
  }

  @Post()
  @Auth(['ADMIN'])
  @UseGuards(RolesGuard)
  async create(
    @AuthUser() user: User,
    @Body() body?: AddItemBuildingRequestDto
  ) {
    return this.buildingService.create(user, body);
  }

  @Patch()
  @Auth(['ADMIN', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async update(
    @AuthUser() user: User,
    @Body() body?: updateBuildingRequestDto
  ) {
    return this.buildingService.update(user, body);
  }

  @Delete()
  @Auth(['ADMIN', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async delete(
    @AuthUser() user: User,
    @Body() body?: deleteBuildingRequestDto
  ) {
    return this.buildingService.delete(user, body);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @Auth(['ADMIN', 'SUPERADMIN', 'USER'])
  @UseGuards(RolesGuard)
  async saveImage(
    @AuthUser() user: User,
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.buildingService.saveBuildingImage({
      user: user,
      file: file,
    })
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
    return this.buildingService.saveBuildingDocument({
      user: user,
      file: file,
    })
  }
} 