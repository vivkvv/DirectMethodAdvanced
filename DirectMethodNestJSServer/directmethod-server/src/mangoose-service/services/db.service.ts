import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { User } from '../models/user.model';
import { Method } from '../models/method.model';
import { Action } from '../models/actions.model';
import { UserService } from './user.service';
import { EventsService } from './events.service';
import { OptionsService } from './options.service';
import { S3Servers } from '../models/s3servers.model';
import { S3ServersService } from './s3servers.service';

@Injectable()
export class DBService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Method.name) private readonly methodModel: Model<Method>,
    @InjectModel(Action.name) private readonly actionModel: Model<Action>,
    @InjectModel(S3Servers.name) private readonly seServersModel: Model<S3Servers>,
    private readonly userService: UserService,
    private readonly eventService: EventsService,
    private readonly optionsSerice: OptionsService,
    private readonly s3ServersService: S3ServersService
  ) {}

  async handleGoogleLogin(googleUser) {

    const user = await this.userService.getUserByUserUniqId(googleUser.userId);

    if (!user) {
      const method = await this.methodModel.findOne({ name: 'google' });
      await this.userService.createUser(method._id, googleUser.userId);
      await this.eventService.createRegisterEvent(googleUser.userId);
    }

    await this.eventService.createEnterEvent(googleUser.userId);
  }

  async handleLogout(userUniqId) {
    await this.eventService.createExitEvent(userUniqId);
  }

  async saveOptions(userUniqId: any, buffer: Buffer) {
    await this.optionsSerice.saveOption(userUniqId, buffer)
  }

  async loadOptions(userUniqId: any) {
    return await this.optionsSerice.loadOptions(userUniqId);
  }

  async saveS3Server(userUniqId: any, buffer: Buffer) {
    await this.s3ServersService.saveServer(userUniqId, buffer)
  }

  async loadS3Servers(userUniqId: any) {
    return await this.s3ServersService.loadServers(userUniqId);
  }

  async removeS3Servers(userUniqId: any, configurationName: string){
    return await this.s3ServersService.removeS3Servers(userUniqId,configurationName);
  }

}
