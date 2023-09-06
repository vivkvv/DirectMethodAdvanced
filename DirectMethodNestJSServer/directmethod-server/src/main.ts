import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import express, { json, urlencoded } from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, '../..', 'public')));
  } else {
    // app.use(morgan('dev'));
  }
  app.use(morgan('dev'));

  app.use(urlencoded({ extended: false }));
  app.use(json());

  //app.enableCors({});
  await app.listen(3000); //, '0.0.0.0');
}
bootstrap();
