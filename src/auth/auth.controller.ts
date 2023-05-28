import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signUp(): SignupDTO {
    return this.authService.signUp();
  }
}
