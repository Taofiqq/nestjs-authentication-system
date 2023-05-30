import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/auth.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserResponse, LoginResponse } from './entities/auth.entity';
import * as jwt from 'jsonwebtoken';
import { generateOTP } from '../helpers/generateOtp';
import { VerificationToken } from './schema/verification.schema';
import { EmailService } from './mail/email.service';
import { ResetToken } from './schema/reset.token.schema';
import { generatePasswordResetToken } from 'src/helpers/generateResetPasswordToken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(VerificationToken.name)
    private readonly verificationTokenModel: Model<VerificationToken>,
    @InjectModel(ResetToken.name)
    private readonly resetTokenModel: Model<ResetToken>,
    public readonly emailService: EmailService,
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

    const OTP = generateOTP(4);

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

  async verifyEmail(otp: string, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const verificationToken = await this.verificationTokenModel.findOne({
      user: userId,
      token: otp,
      purpose: 'email-verification',
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid OTP');
    }
    if (verificationToken.used) {
      throw new BadRequestException('OTP already used');
    }
    if (verificationToken.expiration < new Date(Date.now())) {
      throw new BadRequestException('OTP expired');
    }
    verificationToken.used = true;
    await verificationToken.save();
    user.isEmailVerified = true;
    await user.save();

    await this.emailService.verifyEmail(user.email);
    return 'Email Verified';
  }

  //forgot password
  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    // find token by the user

    const resetToken = await this.resetTokenModel.findOne({
      user: user._id.toString(),
    });

    if (resetToken) {
      if (resetToken.expiration > new Date(Date.now())) {
        throw new BadRequestException(
          'Reset token already sent, Please wait for 1hr to request for another token',
        );
      }
    }
    const token = generatePasswordResetToken(20);

    const newResetToken = new this.resetTokenModel({
      user: user._id.toString(),
      token,
      expiration: new Date(Date.now() + 1000 * 60 * 60),
    });

    await newResetToken.save();
    await this.emailService.forgotPassword(user._id.toString(), email, token);
    return 'Token Sent';
  }

  // reset password

  async resetPassword(token: string, password: string) {
    const resetToken = await this.resetTokenModel.findOne({
      token,
    });
    if (!resetToken) {
      throw new BadRequestException('Invalid Token');
    }
    if (resetToken.expiration < new Date(Date.now())) {
      throw new BadRequestException('Token Expired');
    }
    const user = await this.userModel.findById(resetToken.user);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    //check if previous password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      throw new BadRequestException('Cannot use previous password');
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    resetToken.expiration = new Date(Date.now());
    await resetToken.save();
    await this.emailService.resetPassword(user.email);
    return 'Password Reset Successful';
  }
}
