import { BadRequestException, Injectable } from '@nestjs/common';
import { Building, RentBuilding, User } from 'generated/prisma';
import { WebResponse } from 'src/DTO/globalsResponse';
import { dataNotFound, deleteDataSuccess, getDataSuccess, postDataSuccess, updateDataSuccess } from 'src/DTO/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRentBuildingRequestDto, DeleteRentBuildingRequestDto, UpdateRentBuildingRequestDto } from './ren-building.dto';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class RentBuildingService {
  constructor(
    private prismaService: PrismaService,
    private invoiceService: InvoiceService
  ) { }

  async getAll(id?: string): Promise<WebResponse<RentBuilding | RentBuilding[]>> {
    let rentBuilding: RentBuilding | RentBuilding[];
    rentBuilding = await this.prismaService.rentBuilding.findMany({
      include: {
        _count: true,
        invoice: true
      },
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (id) {
      rentBuilding = await this.prismaService.rentBuilding.findUnique({
        where: {
          id: id,
          deletedAt: null
        },
        include: {
          _count: true,
          invoice: true
        }
      })
    }

    return {
      success: true,
      message: getDataSuccess
    }
  }

  async create(body: CreateRentBuildingRequestDto, user: User): Promise<WebResponse<RentBuilding>> {
    const building = await this.getBuildingById(body.buildingId)

    if (!building) {
      throw new BadRequestException(dataNotFound)
    }

    const rent = await this.prismaService.rentBuilding.create({
      data: {
        userId: user.id,
        buildingId: body.buildingId,
        startDate: body.startDate,
        endDate: body.endDate,
        status: 'PENDING',
        createdBy: user.id
      }
    })

    return {
      success: true,
      message: postDataSuccess,
      data: rent
    }
  }

  async update(body: UpdateRentBuildingRequestDto, user: User): Promise<WebResponse<RentBuilding>> {
    let rent = await this.prismaService.rentBuilding.findUnique({
      where: {
        id: body.id,
        deletedAt: null
      },
      include: {
        user: true,
        building: {
          include: {
            buildingAddress: true,
            user: true
          }
        }
      }
    })

    if (!rent) {
      throw new BadRequestException(dataNotFound)
    }


    await this.prismaService.rentBuilding.update({
      where: {
        id: body.id
      },
      data: {
        status: body.status,
        updatedBy: user.id
      }
    })

    if (body.status === 'SUCCESS') {
      const address = `${rent.building.buildingAddress[0].jalan}, RT ${rent.building.buildingAddress[0].rt}, RW ${rent.building.buildingAddress[0].rw},${rent.building.buildingAddress[0].kelurahan}, ${rent.building.buildingAddress[0].kecamatan}, ${rent.building.buildingAddress[0].kota}, ${rent.building.buildingAddress[0].provinsi} ${rent.building.buildingAddress[0].kodepos}`

      const generateInvoice = await this.invoiceService.generateInvoice({
        buidingName: rent.building.name,
        buildingAddress: address,
        buildingUserEmail: rent.building.user.email,
        buildingUserName: rent.building.user.email,
        buildingUserPhone: rent.building.user.phone,
        userName: rent.user.name,
        userEmail: rent.user.email,
        userPhone: rent.user.phone,
        price: rent.building.price,
        startDate: rent.startDate,
        endDate: rent.endDate
      })

      await this.prismaService.invoice.create({
        data: {
          rentId: rent.id,
          customId: generateInvoice.data.customId,
          url: generateInvoice.data.invoiceUrl,
          createdBy: user.id
        }
      })
    }

    return {
      success: true,
      message: updateDataSuccess,
      data: rent
    }
  }

  async getBuildingById(id: string): Promise<Building> {
    const rent = await this.prismaService.building.findUnique({
      where: {
        id: id,
        deletedAt: null
      }
    })

    if (!rent) {
      return null
    }

    return rent
  }

  async deleteById(body: DeleteRentBuildingRequestDto): Promise<WebResponse<boolean>> {

    const rent = await this.prismaService.rentBuilding.findUnique({
      where: {
        id: body.id,
        deletedAt: null
      }
    })

    if (!rent) {
      throw new BadRequestException(dataNotFound)
    }

    await this.prismaService.rentBuilding.update({
      where: {
        id: body.id
      },
      data: {
        deletedAt: new Date,
        deletedBy: rent.userId
      }
    })

    return {
      message: deleteDataSuccess,
      success: true
    }
  }
}
