import { Body, Controller, Get, HttpStatus, ParseFilePipeBuilder, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/common/roles.guard';
import { Auth, AuthUser } from 'src/common/auth.decorator';
import { User } from 'generated/prisma';
import { UpdateUserAddressAuthDto, UpdateUserAuthDto, UpdateUserNewPasswordAuthDto } from './user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/user')
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  @Get()
  async getAll(
    @Query('id') id?: string
  ) {
    return this.userService.getAll(id);
  }

  @Get('/auth')
  @Auth(['ADMIN', 'USER', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async getUserAuth(
    @AuthUser() user: User,
  ) {
    return this.userService.getUserAuth(user);
  }

  @Patch('/auth')
  @Auth(['ADMIN', 'USER', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async updateUserAuth(
    @AuthUser() user: User,
    @Body() body?: UpdateUserAuthDto
  ) {
    return this.userService.updateUserAuth(user, body);
  }

  @Patch('/auth/address')
  @Auth(['ADMIN', 'USER', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async updateUserAddressAuth(
    @AuthUser() user: User,
    @Body() body?: UpdateUserAddressAuthDto
  ) {
    return this.userService.updateUserAddressAuth(user, body);
  }

  @Post('/auth/photo')
  @UseInterceptors(FileInterceptor('image'))
  @Auth(['ADMIN', 'USER', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async updateUserPhotoAuth(
    @AuthUser() user: User,
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.userService.updateUserPhotoAuth(user, image);
  }

  @Patch('/auth/password')
  @Auth(['ADMIN', 'USER', 'SUPERADMIN'])
  @UseGuards(RolesGuard)
  async updateUserNewPasswordAuth(
    @AuthUser() user: User,
    @Body() body?: UpdateUserNewPasswordAuthDto
  ) {
    return this.userService.updateUserNewPasswordAuth(user, body);
  }
}
