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
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(VerificationToken.name)
    private readonly verificationTokenModel: Model<VerificationToken>,
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

    // send mail with nodemmailer

    console.log(process.env.MAIL_TRAP_PASSWORD);
    console.log(process.env.MAIL_TRAP_USERNAME);

    const transporter = nodemailer.createTransport({
      auth: {
        user: process.env.MAIL_TRAP_USERNAME,
        pass: process.env.MAIL_TRAP_PASSWORD,
      },
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
    });

    const mailOptions = {
      from: 'abumahfuz21@gmail.com',
      to: email,
      subject: 'Email Verification',
      text: `Your OTP is ${OTP}`,
      html: `<h1>Here is your ${OTP}<h1>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
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
