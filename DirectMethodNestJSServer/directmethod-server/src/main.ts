import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import express, { json, urlencoded } from 'express';
import { join } from 'path';

// import { MongoClient } from 'mongodb';

async function bootstrap() {
  // const uri =
  //   'mongodb+srv://vivkvv:CF5rGfrtvEF2vGs7@directcluster0.tyh8vrd.mongodb.net/';

  // try {
  //   const client = await MongoClient.connect(uri, {});
  //   console.log('Connected to MongoDB');
  //   client.close();
  // } catch (err) {
  //   console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
  // }
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, '../..', 'public')));
  } else {
    // app.use(morgan('dev'));
  }
  app.use(morgan('dev'));

  app.use(urlencoded({ extended: false }));
  app.use(json());

  // const httpAdapter = app.getHttpAdapter();
  // httpAdapter.get('*', (req, res) => {
  //   res.sendFile(join(__dirname, '../..', 'public', 'index.html'));
  // });

  //app.enableCors({});
  await app.listen(3000); //, '0.0.0.0');
}
bootstrap();
