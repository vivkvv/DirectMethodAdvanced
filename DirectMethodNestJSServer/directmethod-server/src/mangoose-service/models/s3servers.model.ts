import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class S3Servers extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', index: true })
  usersId: string;

  @Prop({ type: Buffer })
  options: Buffer;
}

export const S3ServersSchema = SchemaFactory.createForClass(S3Servers);
