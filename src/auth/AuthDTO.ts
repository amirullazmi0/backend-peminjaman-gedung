import { IsEmail, IsNotEmpty } from "class-validator";

export class authLoginRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class authLoginResponse {
  id: string
  email: string;
  name: string;
  accessToken: string;
}