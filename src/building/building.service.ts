import { Injectable } from '@nestjs/common';
import { Building, User } from 'generated/prisma';
import { WebResponse } from 'src/DTO/globalsResponse';
import { dataNotFound, deleteDataSuccess, getDataSuccess, updateDataSuccess } from 'src/DTO/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItemBuildingRequestDto, deleteBuildingRequestDto, updateBuildingPhotoRequestDto, updateBuildingRequestDto } from './buildingDto';

@Injectable()
export class BuildingService {
  constructor(
    private prismaService: PrismaService
  ) { }

  async getAll(id?: string): Promise<WebResponse<Building | Building[]>> {
    let building: Building | Building[]
    if (id) {
      building = await this.prismaService.building.findMany({
        where: {
          id: id,
          deletedAt: null
        },
        include: {
          buildingPhoto: true,
          buildingAddress: true,
          SupportDocumentRequirement: true
        }
      })
    } else {
      building = await this.prismaService.building.findMany({
        where: {
          deletedAt: null
        },
        include: {
          buildingPhoto: true,
          buildingAddress: true,
          SupportDocumentRequirement: true
        }
      })
    }

    return {
      success: true,
      message: getDataSuccess,
      data: building
    }
  }

  async create(user: User, body: AddItemBuildingRequestDto): Promise<WebResponse<Building>> {
    const building = await this.prismaService.building.create({
      data: {
        userId: user.id,
        name: body.name,
        price: body.price,
        description: body.description,
      },
    });

    body.photo.url && body.photo.url.map(async (ss) => {
      await this.prismaService.buildingPhoto.create({
        data: {
          url: ss,
          buildingId: building.id
        }
      })
    })

    await this.prismaService.buildingAddress.create({
      data: {
        buildingId: building.id,
        lat: body.address.lat,
        lng: body.address.lng,
        jalan: body.address.jalan,
        kelurahan: body.address.kelurahan,
        kecamatan: body.address.kecamatan,
        kota: body.address.kota,
        provinsi: body.address.provinsi,
        kodepos: body.address.kodepos,
        rt: body.address.rt,
        rw: body.address.rw,
      }
    })

    if (body.supportDocumentRequirement && body.supportDocumentRequirement.length > 0) {
      body.supportDocumentRequirement.map(async (ss) => {
        await this.prismaService.supportDocumentRequirement.create({
          data: {
            name: ss.name,
            buildingId: building.id
          }
        })
      })
    }

    return {
      success: true,
      message: getDataSuccess,
      data: building
    }
  }

  async delete(user: User, body: deleteBuildingRequestDto): Promise<WebResponse<Building>> {
    const building = await this.prismaService.building.findUnique({
      where: {
        id: body.id,
        deletedAt: null
      }
    })

    if (building) {
      await this.prismaService.building.update({
        where: {
          id: body.id,
        },
        data: {
          deletedAt: new Date,
          deletedBy: user.id
        }
      })
      return {
        success: true,
        message: deleteDataSuccess,
      }
    } else {
      return {
        success: false,
        message: dataNotFound,
      }
    }
  }

  async updateBuilding(user: User, body: updateBuildingRequestDto): Promise<WebResponse<Building>> {

    const building = await this.prismaService.building.findUnique({
      where: {
        id: body.id,
        deletedAt: null
      }
    })

    if (building) {
      await this.prismaService.building.update({
        where: {
          id: body.id,
        },
        data: {
          name: body.name,
          price: body.price,
          description: body.description,
          updatedBy: user.id
        }
      })
      return {
        success: true,
        message: updateDataSuccess,
      }
    } else {
      return {
        success: false,
        message: dataNotFound,
      }
    }

  }

  async updateBuildingPhoto(user: User, body: updateBuildingPhotoRequestDto): Promise<WebResponse<Building>> {
    const building = await this.prismaService.building.findUnique({
      where: {
        id: body.id,
        deletedAt: null
      }
    })

    if (building) {
      body.url && body.url.map(async (ss) => {
        await this.prismaService.buildingPhoto.create({
          data: {
            url: ss,
            buildingId: body.id,
            updatedBy: user.id
          }
        })
      })
      return {
        success: true,
        message: updateDataSuccess,
      }
    } else {
      return {
        success: false,
        message: dataNotFound,
      }
    }

  }

  async updateBuildingAddress() {

  }

  async updateSupportDocumentRequirement() {

  }
}
