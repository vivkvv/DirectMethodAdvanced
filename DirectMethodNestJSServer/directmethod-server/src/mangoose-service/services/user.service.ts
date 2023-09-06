import { Injectable } from '@nestjs/common';
import { Model, Schema } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async createUser(
    methodsId: Schema.Types.ObjectId,
    userUniqId: string,
  ): Promise<User> {
    const newUser = new this.userModel({ methodsId, userUniqId });
    return await newUser.save();
  }

  async getUserByUserUniqId(userUniqId) {
    const user = await this.userModel
      .findOne({ userUniqId: userUniqId })
      .exec();
    return user;
  }

}
