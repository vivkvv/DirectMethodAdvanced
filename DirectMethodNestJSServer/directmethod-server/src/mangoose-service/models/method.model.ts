import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Method extends Document {
    @Prop({unique: true, required: true, maxlength: 16})
    name: string
}

export const MethodSchema = SchemaFactory.createForClass(Method);
