import { NestFactory } from '@nestjs/core';
import { Setting } from './setting';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger:
      Setting.env !== 'production'
        ? ['error', 'warn', 'debug', 'verbose', 'log']
        : ['error', 'warn'],
  });

  if (Setting.env !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('Food Ordering API')
      .setDescription('Food Ordering API Documentation')
      .setVersion('1.0')
      .addBearerAuth(undefined, 'BearerAuth')
      .addServer('http://localhost:' + Setting.server.port)
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(Setting.server.port);
}
bootstrap();
