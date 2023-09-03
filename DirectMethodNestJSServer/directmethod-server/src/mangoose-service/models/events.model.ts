import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', index: true })
  usersId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Actions', index: true })
  actionsId: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  extraInfo: any;
}

export const EventSchema = SchemaFactory.createForClass(Event);
