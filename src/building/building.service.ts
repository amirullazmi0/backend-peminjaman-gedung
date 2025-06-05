import { Injectable } from '@nestjs/common';
import { Building, User } from 'generated/prisma';
import { WebResponse } from 'src/DTO/globalsResponse';
import { getDataSuccess } from 'src/DTO/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItemBuildingRequestDto } from './buildingDto';

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
          id: id
        },
        include: {
          buildingPhoto: true,
          buildingAddress: true,
          SupportDocumentRequirement: true
        }
      })
    } else {
      building = await this.prismaService.building.findMany({
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
}
