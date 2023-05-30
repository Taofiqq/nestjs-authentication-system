import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './auth.schema';

export type ResetTokenDocument = ResetToken & Document;

@Schema()
export class ResetToken {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiration: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, default: false })
  used: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken);
