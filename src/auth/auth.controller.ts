import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/auth.dto';
import { CreateUserResponse } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() signupDTO: SignupDTO): Promise<CreateUserResponse> {
    const { email, password, name } = signupDTO;
    const user = await this.authService.signUp(email, password, name);
    return user;
  }
}
