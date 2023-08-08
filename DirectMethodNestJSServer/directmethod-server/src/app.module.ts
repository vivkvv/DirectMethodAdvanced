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

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
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
  ],
  providers: [AppService, AuthService, FilesService],
})
export class AppModule {}
