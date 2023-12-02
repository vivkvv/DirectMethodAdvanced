import { Injectable } from '@nestjs/common';
import { Model, Schema } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { S3Servers } from '../models/s3servers.model';
import { UserService } from './user.service';

@Injectable()
export class S3ServersService {
  constructor(
    @InjectModel(S3Servers.name)
    private readonly s3ServersModel: Model<S3Servers>,
    private readonly userService: UserService,
  ) {}

  async saveServer(userUniqId: any, buffer: Buffer) {
    const user = await this.userService.getUserByUserUniqId(userUniqId);

    await this.s3ServersModel.create({ usersId: user._id, options: buffer });
  }

  async loadServers(userUniqId: any) {
    const user = await this.userService.getUserByUserUniqId(userUniqId);
    const s3Servers = await this.s3ServersModel
      .find({ usersId: user._id })
      .exec();

    return s3Servers.map((server) => {
      // Convert Buffer to string and then parse as JSON
      const options = JSON.parse(server.options.toString());
      return options;
    });
  }

  async removeS3Servers(userUniqId: any, configurationName: string) {
    const user = await this.userService.getUserByUserUniqId(userUniqId);
    const documents = await this.s3ServersModel
      .find({ usersId: user._id })
      .exec();
    const documentsToDelete = documents.filter((doc) => {
      const options = JSON.parse(doc.options.toString());
      return options.configurationName === configurationName;
    });
    for (const doc of documentsToDelete) {
      await this.s3ServersModel.deleteOne({ _id: doc._id }).exec();
    }
  }
}
