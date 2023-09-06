import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from '../models/events.model';
import { Action } from '../models/actions.model';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { ActionService } from './actions.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Action.name) private readonly actionModel: Model<Action>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UserService,
    private readonly actionService: ActionService,
  ) {}

  async createEvent(
    usersId: Types.ObjectId,
    actionsId: Types.ObjectId,
    date: Date,
    extraInfo: any,
  ): Promise<Event> {
    const newEvent = new this.eventModel({
      usersId,
      actionsId,
      date,
      extraInfo,
    });
    return await newEvent.save();
  }

  async createRegisterEvent(userUniqId) {
    const action = await this.actionService.getActionByName('register');
    const user = await this.userService.getUserByUserUniqId(userUniqId);
    return await this.createEvent(user._id, action._id, new Date(), null);
  }

  async createEnterEvent(userUniqId) {
    const action = await this.actionService.getActionByName('enter');
    const user = await this.userService.getUserByUserUniqId(userUniqId);
    return await this.createEvent(user._id, action._id, new Date(), null);
  }

  async createExitEvent(userUniqId) {
    const action = await this.actionService.getActionByName('exit');
    const user = await this.userService.getUserByUserUniqId(userUniqId);
    if (Boolean(action) && Boolean(user)) {
      await this.createEvent(user._id, action._id, new Date(), null);
    }
    else {
      console.log("Can't find user for %s", userUniqId);
    }
  }
}
