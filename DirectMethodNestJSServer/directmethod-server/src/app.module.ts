import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { FilesService } from './files-service/files-service.service';
import { TopicsController } from './topics/topics.controller';
import { LessonsController } from './lessons/lessons.controller';
import { ImagesController } from './images/images.controller';
import { NextLessonController } from './next.lesson/next.lesson.controller';
import { PrevLessonController } from './prev.lesson/prev.lesson.controller';
import { NotFoundController } from './not-found-controller/not-found.controller';
import { AuthRedirectControllerController } from './auth-redirect-controller/auth-redirect-controller.controller';
import { DatabaseModule } from './mangoose-service/mongoose.module';
//import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
    DatabaseModule
    // MongooseModule.forRoot(
    //   'mongodb+srv://vivkvv:CF5rGfrtvEF2vGs7@directcluster0.tyh8vrd.mongodb.net/?retryWrites=true&w=majority',
    // ),
  ],
  controllers: [
    AppController,
    AuthController,
    TopicsController,
    LessonsController,
    ImagesController,
    NextLessonController,
    PrevLessonController,
    NotFoundController,
    AuthRedirectControllerController,
  ],
  providers: [AppService, AuthService, FilesService],
})
export class AppModule {}
