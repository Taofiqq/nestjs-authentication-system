export class SignupDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export class LoginDTO {
  email: string;
  password: string;
}
