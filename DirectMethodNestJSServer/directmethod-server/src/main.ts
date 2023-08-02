import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';

console.log('1');

async function bootstrap() {
  console.log('2');
  const app = await NestFactory.create(AppModule);
  console.log('3');
  app.use(morgan('dev'));
  console.log('4');
  app.enableCors({});
  console.log('5');
  await app.listen(3000);
  console.log('6');
}
bootstrap();

console.log('7');
