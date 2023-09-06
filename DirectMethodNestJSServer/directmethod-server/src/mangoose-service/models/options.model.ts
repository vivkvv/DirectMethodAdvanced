import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Option extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', index: true })
  usersId: string;

  @Prop({ type: Buffer })
  options: Buffer;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
