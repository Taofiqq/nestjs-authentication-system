import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './auth.schema';

export type VerificationTokenDocument = VerificationToken & Document;

@Schema()
export class VerificationToken {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiration: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, default: false })
  used: boolean;

  @Prop({ type: String, required: true })
  purpose: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);
