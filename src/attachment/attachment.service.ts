import { Injectable } from '@nestjs/common';

import ImageKit from 'imagekit';
import { WebResponse } from 'src/DTO/globalsResponse';

@Injectable()
export class AttachmentService {

  private imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

  private path = 'rent-building'


  async saveFileImageKit({
    file,
    folder,
  }: {
    file: Express.Multer.File;
    folder?: string;
  }): Promise<{ path: string }> {

    const imageSave = this.imagekit.upload({
      file: file.buffer,
      folder: `/${this.path}/images/${folder}`,
      fileName: file.originalname,
      extensions: [
        {
          name: 'google-auto-tagging',
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    });


    return {
      path: (await imageSave).url,
    };
  }


  async saveDocumentImageKit({
    file,
    folder,
  }: {
    file: Express.Multer.File;
    folder?: string;
  }): Promise<{ path: string }> {

    const documentSave = this.imagekit.upload({
      file: file.buffer,
      folder: `/${this.path}/documents/${folder}`,
      fileName: file.originalname,
      extensions: [
        {
          name: 'google-auto-tagging',
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    });


    return {
      path: (await documentSave).url,
    };
  }


  async saveFile({
    file,
    folder,
  }: {
    file: Express.Multer.File;
    folder?: string;
  }): Promise<WebResponse<{
    url: string
  }>> {

    const imageSave = await this.imagekit.upload({
      file: file.buffer,
      folder: `/rent-buildings/${folder}`,
      fileName: file.originalname,
      extensions: [
        {
          name: 'google-auto-tagging',
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    });


    const url = imageSave.url;
    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: url
      }
    };
  }
}
