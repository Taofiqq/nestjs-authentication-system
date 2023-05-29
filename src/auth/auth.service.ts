import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDTO } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/auth.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserResponse, LoginResponse } from './entities/auth.entity';
import * as jwt from 'jsonwebtoken';
import { generateOtp } from '../helpers/generateOtp';
import { VerificationToken } from './schema/verification.schema';
import { EmailService } from './mail/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(VerificationToken.name)
    private readonly verificationTokenModel: Model<VerificationToken>,
    private readonly emailService: EmailService,
  ) {}
  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<CreateUserResponse> {
    const checkUser = await this.userModel.findOne({ email });
    if (checkUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const newUser = new this.userModel({ email, password, name });
    newUser.password = await bcrypt.hash(password, 10);

    const OTP = generateOtp();

    const newVerificationToken = new this.verificationTokenModel({
      user: newUser._id.toString(),
      token: OTP,
      expiration: new Date(Date.now() + 1000 * 60 * 10),
      purpose: 'email-verification',
    });

    await newVerificationToken.save();

    await this.emailService.sendEmail(OTP, email);
    const user = await newUser.save();
    const response: CreateUserResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
    return response;
  }

  async signIn(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid password');
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
    );

    const response: LoginResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      token,
    };
    return response;
  }
}
