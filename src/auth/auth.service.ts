import { Injectable } from '@nestjs/common';
import { SignupDTO } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/auth.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserResponse } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<CreateUserResponse> {
    const newUser = new this.userModel({ email, password, name });
    newUser.password = await bcrypt.hash(password, 10);
    const user = await newUser.save();
    const response: CreateUserResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
    return response;
  }
}
