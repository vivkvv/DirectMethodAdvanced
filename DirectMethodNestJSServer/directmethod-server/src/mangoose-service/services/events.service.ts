import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from '../models/events.model';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
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
}
