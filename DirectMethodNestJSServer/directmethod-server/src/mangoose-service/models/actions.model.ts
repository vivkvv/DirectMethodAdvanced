import { Schema, Document } from 'mongoose';
import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';

@SchemaDecorator()
export class Action extends Document {
  @Prop({ unique: true, required: true })
  name: string;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
