import { Document, Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document {
    @Prop({type: Types.ObjectId, ref: 'Method', index: true})
    methodsId: Types.ObjectId;

    @Prop({required: true, index: true})
    userUniqId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
