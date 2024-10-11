import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignUpDto extends AuthDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class LoginDto extends AuthDto {}
