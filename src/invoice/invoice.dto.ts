import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  buidingName: string

  @IsString()
  @IsNotEmpty()
  buildingUserName: string

  @IsString()
  @IsNotEmpty()
  buildingUserEmail: string

  @IsString()
  @IsNotEmpty()
  buildingUserPhone: string

  @IsString()
  @IsNotEmpty()
  buildingAddress: string

  @IsString()
  @IsNotEmpty()
  userName: string

  @IsString()
  @IsNotEmpty()
  userEmail: string

  @IsString()
  @IsNotEmpty()
  userPhone: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  @IsDateString()
  @IsNotEmpty()
  startDate: Date

  @IsDateString()
  @IsNotEmpty()
  endDate: Date
}