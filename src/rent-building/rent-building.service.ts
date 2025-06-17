import { BadRequestException, Injectable } from '@nestjs/common';
import { Building, RentBuilding, User } from 'generated/prisma';
import { WebResponse } from 'src/DTO/globalsResponse';
import { dataNotFound, deleteDataSuccess, getDataSuccess, postDataSuccess, updateDataSuccess } from 'src/DTO/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRentBuildingRequestDto, DeleteRentBuildingRequestDto, UpdateRentBuildingRequestDto } from './rent-building.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { AttachmentService } from 'src/attachment/attachment.service';
import dayjs from 'dayjs';

@Injectable()
export class RentBuildingService {
  constructor(
    private prismaService: PrismaService,
    private invoiceService: InvoiceService,
    private attachmentService: AttachmentService
  ) { }

  async getAll(id?: string): Promise<WebResponse<RentBuilding | RentBuilding[]>> {
    let rentBuilding: RentBuilding | RentBuilding[];
    rentBuilding = await this.prismaService.rentBuilding.findMany({
      include: {
        _count: true,
        invoice: true,
        supportDocumentRentBuilding: {
          include: {
            supportDocumentRequirement: {
              select: {
                name: true
              }
            }
          }
        },
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
          invoice: true,
          supportDocumentRentBuilding: {
            include: {
              supportDocumentRequirement: {
                select: {
                  name: true
                }
              }
            }
          },
        }
      })
    }

    return {
      success: true,
      message: getDataSuccess
    }
  }

  async getAllByUser(user: User): Promise<WebResponse<RentBuilding | RentBuilding[]>> {
    let rentBuilding: RentBuilding | RentBuilding[] = await this.prismaService.rentBuilding.findMany({
      where: {
        userId: user.id,
        deletedAt: null
      },
      include: {
        _count: true,
        building: {
          select: {
            buildingPhoto: true,
            name: true
          },
        },
        invoice: true,
        supportDocumentRentBuilding: {
          include: {
            supportDocumentRequirement: {
              select: {
                name: true
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      message: getDataSuccess,
      data: rentBuilding
    }
  }

  async getAllByAdmin(user: User): Promise<WebResponse<RentBuilding | RentBuilding[]>> {
    let rentBuilding: RentBuilding | RentBuilding[] = await this.prismaService.rentBuilding.findMany({
      include: {
        _count: true,
        building: {
          select: {
            buildingPhoto: true,
            name: true
          },
        },
        supportDocumentRentBuilding: {
          include: {
            supportDocumentRequirement: {
              select: {
                name: true
              }
            }
          }
        },
        invoice: true
      },
      where: {
        building: {
          userId: user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      message: getDataSuccess,
      data: rentBuilding
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

    if (body.supportDocumentRequirements.length > 0) {
      body.supportDocumentRequirements.map(async (ss) => {
        await this.prismaService.supportDocumentRentBuilding.create({
          data: {
            supportDocumentRequirementId: ss.supportDocumentId,
            documentUrl: ss.documentUrl,
            rentBuildingId: rent.id,
            createdBy: user.id
          }
        })
      })

    }

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

      const totalDays = dayjs(rent.endDate).diff(dayjs(rent.startDate), 'day') + 1;
      const totalPrice = rent.building.price * totalDays;

      const generateInvoice = await this.invoiceService.generateInvoice({
        buidingName: rent.building.name,
        buildingAddress: address,
        buildingUserEmail: rent.building.user.email,
        buildingUserName: rent.building.user.name,
        buildingUserPhone: rent.building.user.phone,
        userName: rent.user.name,
        userEmail: rent.user.email,
        userPhone: rent.user.phone,
        price: totalPrice,
        startDate: rent.startDate,
        endDate: rent.endDate,
      });

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

  async saveRentDocument({
    user,
    file,
  }: {
    user: User
    file: Express.Multer.File;
  }): Promise<WebResponse<{
    url: string
  }>> {
    const imageSave = await this.attachmentService.saveDocumentImageKit({
      file: file,
      folder: `/${user.id}`
    })

    const url = imageSave.path;

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: url
      }
    }
  }
}
