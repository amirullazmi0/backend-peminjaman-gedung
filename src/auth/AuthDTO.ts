import { IsEmail, isNotEmpty, IsNotEmpty, IsString } from "class-validator";
import { Role } from "generated/prisma";

export class authLoginRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class authForgetPasswordDto {
  @IsEmail()
  email: string;
}

export class authRegisterRequestDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  role: Role;

  @IsNotEmpty()
  password: string;
}


export class authLoginResponse {
  id: string
  email: string;
  name: string;
  accessToken: string;
}

export class authForgetPasswordResponseDto {
  url: string
}

export class authRegisterResponse {
  name: string
  email: string
}