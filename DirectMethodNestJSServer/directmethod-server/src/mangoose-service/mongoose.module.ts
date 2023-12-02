import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Method, MethodSchema } from './models/method.model';
import { User, UserSchema } from './models/user.model';
import { Action, ActionSchema } from './models/actions.model';
import { EventSchema } from './models/events.model';
import { Option, OptionSchema } from './models/options.model';
import { S3Servers, S3ServersSchema } from './models/s3servers.model';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://vivkvv:CF5rGfrtvEF2vGs7@directcluster0.tyh8vrd.mongodb.net/Direct?retryWrites=true&w=majority',
      //'mongodb://localhost:27017/Direct',
    ),
    MongooseModule.forFeature([
      { name: Method.name, schema: MethodSchema },
      { name: User.name, schema: UserSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Event.name, schema: EventSchema },
      { name: Option.name, schema: OptionSchema },
      { name: S3Servers.name, schema: S3ServersSchema},
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
