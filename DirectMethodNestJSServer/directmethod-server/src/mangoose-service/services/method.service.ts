import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Method } from '../models/method.model';

@Injectable()
export class MethodService {
  constructor(
    @InjectModel(Method.name)
    private readonly methodModel: Model<Method>,
  ) {}

  async createMethod(name: string): Promise<Method> {
    const newMethod = new this.methodModel({ name });
    return await newMethod.save();
  }
}
