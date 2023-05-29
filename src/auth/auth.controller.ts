import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() signupDTO: SignupDTO): Promise<SignupDTO> {
    const { email, password, name } = signupDTO;
    const user = await this.authService.signUp(email, password, name);
    return user;
  }
}
