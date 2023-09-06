import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Action } from '../models/actions.model';

@Injectable()
export class ActionService {
  constructor(
    @InjectModel(Action.name) private readonly actionModel: Model<Action>,
  ) {}

  async createAction(name: string): Promise<Action> {
    const newAction = new this.actionModel({ name });
    return await newAction.save();
  }

  async getActionByName(actionName: string) {
    const action = await this.actionModel.findOne({ name: actionName }).exec();
    if (!action) {
      throw new Error("Action 'register' is not found");
    }
    return action;
  }

}