import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api/v1');

  const options = new DocumentBuilder()
  .setTitle("rocket global Exchange Market")
  .setDescription("rocket global Exchange Market")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, options);
SwaggerModule.setup("api-doc", app, document);

  await app.listen(+process.env.PORT);
}
bootstrap();
