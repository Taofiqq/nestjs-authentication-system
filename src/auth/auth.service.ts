import { Injectable } from '@nestjs/common';
import { SignupDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {
  signUp(): SignupDTO {
    return {
      email: '',
      password: '',
      name: '',
    };
  }
}
