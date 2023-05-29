import { Injectable } from '@nestjs/common';
import { SignupDTO } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/auth.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<SignupDTO> {
    const newUser = new this.userModel({ email, password, name });
    const user = await newUser.save();
    return user;
  }
}
