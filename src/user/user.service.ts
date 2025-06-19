import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserPhoto } from 'generated/prisma';
import { WebResponse } from 'src/DTO/globalsResponse';
import { getDataSuccess, updateDataSuccess } from 'src/DTO/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserAddressAuthDto, UpdateUserAuthDto, UpdateUserNewPasswordAuthDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { AttachmentService } from 'src/attachment/attachment.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private attachmentService: AttachmentService
  ) { }

  async getAll(id?: string): Promise<WebResponse<User[] | User>> {
    let users: User[] | User
    users = await this.prismaService.user.findMany()

    if (id) {
      users = await this.prismaService.user.findUnique({
        where: {
          id: id
        }
      })
    }
    return {
      success: true,
      message: getDataSuccess,
      data: users
    }

  }

  async getUserAuth(user: User): Promise<WebResponse<any>> {
    const userAuth = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        userPhoto: {
          select: {
            url: true
          }
        },
        userAddress: {
          select: {
            jalan: true,
            rt: true,
            rw: true,
            kelurahan: true,
            kecamatan: true,
            kota: true,
            provinsi: true,
            kodepos: true
          }
        }
      },
    })
    return {
      success: true,
      message: getDataSuccess,
      data: userAuth
    }
  }

  async updateUserAuth(user: User, body: UpdateUserAuthDto): Promise<WebResponse<{ id: string }>> {
    const phoneIsUnique = await this.prismaService.user.findUnique({
      where: {
        phone: body.phone
      }
    })
    if (phoneIsUnique && phoneIsUnique.id !== user.id) {
      throw new BadRequestException('Phone number already exists')
    }
    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id
      },
      data: { ...body, updatedBy: user.id }
    })

    return {
      success: true,
      message: updateDataSuccess,
      data: {
        id: updatedUser.id
      }
    }
  }

  async updateUserAddressAuth(user: User, body: UpdateUserAddressAuthDto): Promise<WebResponse<{ id: string }>> {
    const updatedUser = await this.prismaService.userAddress.update({
      where: {
        userId: user.id
      },
      data: { ...body, updatedBy: user.id }
    })

    return {
      success: true,
      message: updateDataSuccess,
      data: {
        id: updatedUser.userId
      }
    }
  }
  async updateUserPhotoAuth(user: User, img: Express.Multer.File): Promise<WebResponse<{ url: string }>> {

    if (!img) {
      throw new BadRequestException('Image is required')
    }

    const imgSave = await this.attachmentService.saveFile({
      file: img,
      folder: `/photo_profile/${user.id}`
    })

    const existingPhoto = await this.prismaService.userPhoto.findUnique({
      where: {
        userId: user.id
      }
    })

    let userPhoto: UserPhoto
    if (!existingPhoto) {
      userPhoto = await this.prismaService.userPhoto.create({
        data: {
          userId: user.id,
          url: imgSave.data.url,
          createdBy: user.id,
        }
      })
    } else {
      userPhoto = await this.prismaService.userPhoto.update({
        where: {
          userId: user.id
        },
        data: {
          url: imgSave.data.url,
          updatedBy: user.id
        }
      })
    }

    return {
      success: true,
      message: updateDataSuccess,
      data: {
        url: userPhoto.url
      }
    }
  }

  async updateUserNewPasswordAuth(user: User, body: UpdateUserNewPasswordAuthDto): Promise<WebResponse<{ id: string }>> {

    const hashPassword = await bcrypt.hash(body.password, 10)
    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id
      },
      data: { password: hashPassword, updatedBy: user.id }
    })

    return {
      success: true,
      message: updateDataSuccess,
      data: {
        id: updatedUser.id
      }
    }
  }
}
