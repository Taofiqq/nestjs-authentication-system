import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO, LoginDTO } from './dto/auth.dto';
import { CreateUserResponse, LoginResponse } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() signupDTO: SignupDTO): Promise<CreateUserResponse> {
    const { email, password, name } = signupDTO;
    const user = await this.authService.signUp(email, password, name);
    return user;
  }

  @Get('/login')
  async signIn(@Body() loginDTO: LoginDTO): Promise<LoginResponse> {
    const { email, password } = loginDTO;
    const user = await this.authService.signIn(email, password);
    return user;
  }

  // verify email
  @Post('/verify-email')
  async verifyEmail(@Body() body: { otp: string; userId: string }) {
    const { otp, userId } = body;
    console.log(otp, userId);
    const user = await this.authService.verifyEmail(otp, userId);
    return user;
  }
}
