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

export class authNewPasswordRequestDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;
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

export class authActivationTokenRequest {
  @IsEmail()
  email: string;
}

export class authActivationRequest {
  @IsNotEmpty()
  token: string;
}


export class authLoginResponse {
  id: string
  email: string;
  name: string;
  role: Role;
  accessToken: string;
}

export class authForgetPasswordResponseDto {
  url: string
}

export class authRegisterResponse {
  name: string
  email: string
}

export class tokenVerify {
  email: string
  role: Role
  type: string
  iat: number
  exp: number
}

export class authActivationUserResponse {
  email: string
  name: string
  active: boolean
}