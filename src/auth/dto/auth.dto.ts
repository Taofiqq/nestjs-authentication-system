import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignupDTO {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Password must be between 6 and 20 characters',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
  role?: string;
}

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Password must be between 6 and 20 characters',
  })
  password: string;
}
