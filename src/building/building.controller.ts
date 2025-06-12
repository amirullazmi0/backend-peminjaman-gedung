import { Body, Controller, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Auth, AuthUser } from 'src/common/auth.decorator';
import { RolesGuard } from 'src/common/roles.guard';
import { BuildingService } from './building.service';
import { User } from 'generated/prisma';
import { AddItemBuildingRequestDto } from './buildingDto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/building')
export class BuildingController {
  constructor(
    private buildingService: BuildingService
  ) { }
  @Get(':id')
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