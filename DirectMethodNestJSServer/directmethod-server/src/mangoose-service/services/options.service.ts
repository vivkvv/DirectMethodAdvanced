import { Injectable } from '@nestjs/common';
import { Model, Schema } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Option } from '../models/options.model';
import { UserService } from './user.service';

@Injectable()
export class OptionsService {
  constructor(
    @InjectModel(Option.name)
    private readonly optionModel: Model<Option>,
    private readonly userService: UserService,
  ) {}

  async saveOption(userUniqId: any, buffer: Buffer) {
    const user = await this.userService.getUserByUserUniqId(userUniqId);

    await this.optionModel.updateOne(
      { usersId: user._id },
      { $set: { options: buffer } },
      { upsert: true },
    );
  }

  async loadOptions(userUniqId: any) {
    const user = await this.userService.getUserByUserUniqId(userUniqId);
    const options = await this.optionModel
      .findOne({ usersId: user._id })
      .exec();

    return  options ? options.options : null;
  }
}
