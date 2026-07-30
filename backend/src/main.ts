import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api/v1', { exclude: ['/health'] });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 8090;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`AEGIS Backend running on port ${port}`);
  logger.log(`Health: http://localhost:${port}/health`);
  logger.log(`API:    http://localhost:${port}/api/v1`);
}

bootstrap();
