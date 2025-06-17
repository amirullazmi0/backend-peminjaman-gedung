import { BadRequestException, Injectable } from '@nestjs/common';
import { Building, User } from 'generated/prisma';
import { WebResponse } from 'src/DTO/globalsResponse';
import { dataNotFound, deleteDataSuccess, getDataSuccess, updateDataSuccess } from 'src/DTO/messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItemBuildingRequestDto, deleteBuildingRequestDto, updateBuildingRequestDto } from './buildingDto';
import { AttachmentService } from 'src/attachment/attachment.service';

@Injectable()
export class BuildingService {
  constructor(
    private prismaService: PrismaService,
    private attachmentService: AttachmentService
  ) { }

  async getAll(id?: string): Promise<WebResponse<Building | Building[]>> {
    let building: Building | Building[];

    if (id) {
      // Use findUnique when you're expecting a single result
      building = await this.prismaService.building.findUnique({
        where: {
          id: id,
          deletedAt: null, // Make sure we exclude soft-deleted buildings
        },
        include: {
          buildingPhoto: {
            where: {
              deletedAt: null
            }
          },
          buildingAddress: true,
          supportDocumentRequirement: {
            where: {
              deletedAt: null
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              name: true,
            }
          }
        },
      });

      // If no building is found, return a 404 response or a suitable message
      if (!building) {
        return {
          success: false,
          message: 'Building not found',
          data: null,
        };
      }
    } else {
      // When no ID is provided, return all buildings
      building = await this.prismaService.building.findMany({
        where: {
          deletedAt: null, // Only active buildings (not soft-deleted)
        },
        include: {
          buildingPhoto: {
            where: {
              deletedAt: null
            }
          },
          buildingAddress: true,
          supportDocumentRequirement: {
            where: {
              deletedAt: null
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return {
      success: true,
      message: getDataSuccess, // Make sure `getDataSuccess` is defined and holds a meaningful message
      data: building,
    };
  }

  async getAllByUser(user: User, id?: string): Promise<WebResponse<Building | Building[]>> {
    let building: Building | Building[];

    if (id) {
      // Use findUnique when you're expecting a single result
      building = await this.prismaService.building.findUnique({
        where: {
          id: id,
          deletedAt: null,
          userId: user.id
        },
        include: {
          buildingPhoto: {
            where: {
              deletedAt: null
            }
          },
          buildingAddress: true,
          supportDocumentRequirement: {
            where: {
              deletedAt: null
            }
          },
        },
      });

      // If no building is found, return a 404 response or a suitable message
      if (!building) {
        return {
          success: false,
          message: 'Building not found',
          data: null,
        };
      }
    } else {
      // When no ID is provided, return all buildings
      building = await this.prismaService.building.findMany({
        where: {
          deletedAt: null,
          userId: user.id
        },
        include: {
          buildingPhoto: {
            where: {
              deletedAt: null
            }
          },
          buildingAddress: true,
          supportDocumentRequirement: {
            where: {
              deletedAt: null
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return {
      success: true,
      message: getDataSuccess, // Make sure `getDataSuccess` is defined and holds a meaningful message
      data: building,
    };
  }


  async create(user: User, body: AddItemBuildingRequestDto): Promise<WebResponse<Building>> {
    const building = await this.prismaService.building.create({
      data: {
        userId: user.id,
        name: body.name,
        price: body.price,
        description: body.description,
        createdBy: user.id
      },
    });

    body.photo && body.photo.length > 0 && body.photo.map(async (ss) => {
      await this.prismaService.buildingPhoto.create({
        data: {
          url: ss.url,
          buildingId: building.id,
          createdBy: user.id
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
        createdBy: user.id
      }
    })

    if (body.supportDocumentRequirement && body.supportDocumentRequirement.length > 0) {
      body.supportDocumentRequirement.map(async (ss) => {
        await this.prismaService.supportDocumentRequirement.create({
          data: {
            name: ss.name,
            buildingId: building.id,
            templateDocumentUrl: ss.templateDocumentUrl,
            createdBy: user.id
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

  async update(user: User, body: updateBuildingRequestDto): Promise<WebResponse<Building>> {
    const photos = body.photo;
    const documents = body.supportDocumentRequirement;

    let building = await this.prismaService.building.findUnique({
      where: {
        id: body.id,
        deletedAt: null,
      },
    });

    if (!building) {
      throw new BadRequestException(dataNotFound);
    }

    // Update building
    building = await this.prismaService.building.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        updatedBy: user.id,
      },
    });

    // Update building address
    await this.prismaService.buildingAddress.update({
      where: {
        buildingId: body.id,
      },
      data: {
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
        updatedBy: user.id,
      },
    });

    if (photos && photos.length > 0) {
      const photoBefore = await this.prismaService.buildingPhoto.findMany({
        where: {
          buildingId: building.id,
        },
      });

      const currentPhotoIds = photos.map(photo => photo.id);
      const photosToDelete = photoBefore.filter(photo => !currentPhotoIds.includes(photo.id));


      await this.prismaService.buildingPhoto.updateMany({
        where: {
          buildingId: building.id,
          id: { in: photosToDelete.map(photo => photo.id) },
        },
        data: {
          deletedAt: new Date(),
          deletedBy: user.id
        },
      });

      // Update or create new photos
      await Promise.all(
        photos.map(async (ss) => {
          if (ss.id) {
            await this.prismaService.buildingPhoto.update({
              where: {
                id: ss.id,
              },
              data: {
                url: ss.url,
                updatedBy: user.id,
              },
            });
          } else {
            await this.prismaService.buildingPhoto.create({
              data: {
                url: ss.url,
                buildingId: building.id,
                createdBy: user.id,
              },
            });
          }
        })
      );
    }

    // Soft delete missing documents
    if (documents && documents.length > 0) {
      const documentBefore = await this.prismaService.supportDocumentRequirement.findMany({
        where: {
          buildingId: building.id,
        },
      });

      const currentDocumentIds = documents.map(doc => doc.id);
      const documentsToDelete = documentBefore.filter(doc => !currentDocumentIds.includes(doc.id));

      // Soft delete documents that are not in the new list
      await this.prismaService.supportDocumentRequirement.updateMany({
        where: {
          buildingId: building.id,
          id: { in: documentsToDelete.map(doc => doc.id) },
        },
        data: {
          deletedAt: new Date(), // Soft delete
          deletedBy: user.id,
        },
      });

      // Update or create new documents
      await Promise.all(
        documents.map(async (ss) => {
          if (ss.id) {
            await this.prismaService.supportDocumentRequirement.update({
              where: {
                id: ss.id,
              },
              data: {
                name: ss.name,
                templateDocumentUrl: ss.templateDocumentUrl,
                updatedBy: user.id,
              },
            });
          } else {
            await this.prismaService.supportDocumentRequirement.create({
              data: {
                name: ss.name,
                templateDocumentUrl: ss.templateDocumentUrl,
                buildingId: building.id,
                createdBy: user.id,
              },
            });
          }
        })
      );
    }

    return {
      success: true,
      message: updateDataSuccess,
    };
  }



  async saveBuildingImage({
    user,
    file,
  }: {
    user: User
    file: Express.Multer.File;
  }): Promise<WebResponse<{
    url: string
  }>> {
    const imageSave = await this.attachmentService.saveFileImageKit({
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

  async saveBuildingDocument({
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
