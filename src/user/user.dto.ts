import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserAuthDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  phone: string
}

export class UpdateUserAddressAuthDto {
  @IsNotEmpty()
  @IsString()
  jalan: string

  @IsNotEmpty()
  @IsString()
  rt: string

  @IsNotEmpty()
  @IsString()
  rw: string

  @IsNotEmpty()
  @IsString()
  kelurahan: string

  @IsNotEmpty()
  @IsString()
  kecamatan: string

  @IsNotEmpty()
  @IsString()
  kota: string

  @IsNotEmpty()
  @IsString()
  provinsi: string

  @IsNotEmpty()
  @IsString()
  kodepos: string
}


export class UpdateUserNewPasswordAuthDto {
  @IsNotEmpty()
  @IsString()
  password: string
}