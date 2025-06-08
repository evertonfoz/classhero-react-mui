import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 👈 necessário

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir CORS para o frontend
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // app.setGlobalPrefix('api');

  // ✅ Ativa validação e transformação automática em todos os endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,   // converte string para number, etc
      whitelist: true,   // remove propriedades não definidas nos DTOs
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Backend rodando em: http://localhost:${port}`);
}
bootstrap();
