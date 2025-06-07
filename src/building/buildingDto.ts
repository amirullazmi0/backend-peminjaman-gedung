import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, IsLatitude, IsLongitude, IsUrl } from "class-validator";
import { Type } from 'class-transformer';


class AddressDto {
  @IsNotEmpty()
  @IsString()
  jalan: string;

  @IsNotEmpty()
  @IsString()
  rt: string;

  @IsNotEmpty()
  @IsString()
  rw: string;

  @IsNotEmpty()
  @IsString()
  kelurahan: string;

  @IsNotEmpty()
  @IsString()
  kecamatan: string;

  @IsNotEmpty()
  @IsString()
  kota: string;

  @IsNotEmpty()
  @IsString()
  provinsi: string;

  @IsNotEmpty()
  @IsString()
  kodepos: string;

  @IsLatitude()
  lat: string;

  @IsLongitude()
  lng: string;
}

class PhotoDto {
  @IsArray()
  @IsString({ each: true })
  url: string[];
}

class SupportDocumentRequirementDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  templateDocumentUrl?: string;
}

export class AddItemBuildingRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested()
  @Type(() => PhotoDto)
  photo: PhotoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportDocumentRequirementDto)
  supportDocumentRequirement: SupportDocumentRequirementDto[];
}

export class deleteBuildingRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class updateBuildingRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;
}

export class updateBuildingPhotoRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsArray()
  @IsString({ each: true })
  url: string[];
}

