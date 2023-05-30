import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailService {
  async sendEmail(OTP: string, email: string): Promise<void> {
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
      html: `<h1>Here is your OTP: ${OTP}<h1>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async verifyEmail(email: string) {
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
      html: 'Congratulations, Your Email Have been verified successfully',
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async forgotPassword(id: string, email: string, token: string) {
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
      subject: 'Forgot Password',
      html: `<h1>Here is your Token to reset your password: http://localhost:3000/reset-password?token=${token}&id=${id}<h1>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async resetPassword(email: string) {
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
      subject: 'Reset Password',
      html: 'Congratulations, Your Password Have been reset successfully',
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
