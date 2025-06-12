import { Controller, HttpStatus, ParseFilePipeBuilder, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'generated/prisma';
import { Auth, AuthUser } from 'src/common/auth.decorator';
import { RolesGuard } from 'src/common/roles.guard';
import { AttachmentService } from './attachment.service';

@Controller('api/attachment')
export class AttachmentController {
  constructor(
    private attachmentService: AttachmentService,
  ) { }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @Auth(['ADMIN', 'SUPERADMIN', 'USER'])
  @UseGuards(RolesGuard)
  async saveImage(
    @UploadedFiles(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.attachmentService.saveFile({
      file: file,
      folder: 'images',
    });
  }
}
