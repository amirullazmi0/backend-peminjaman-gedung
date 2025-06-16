import { Type } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { RentStatus } from "generated/prisma";

export class DeleteRentBuildingRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class CreateRentBuildingRequestDto {
  @IsNotEmpty()
  @IsString()
  buildingId: string

  @IsNotEmpty()
  @IsDateString()
  startDate: string

  @IsNotEmpty()
  @IsDateString()
  endDate: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRentBuildingRequestDto)
  supportDocumentRequirement: CreateRentBuildingRequestDto[];
}


export class CreateSupportDocumentRentBuildingRequestDto {
  @IsNotEmpty()
  @IsString()
  supportDocumentId: string

  @IsNotEmpty()
  @IsString()
  documentUrl: string
}

export class UpdateRentBuildingRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsNotEmpty()
  @IsString()
  status: RentStatus
}



