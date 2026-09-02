import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para conexión con Angular y dispositivos móviles
  app.enableCors();

  // Prefijo global de la API
  app.setGlobalPrefix('api');

  // Validación estricta de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('CeroFallas Enterprise API')
    .setDescription(
      'API REST y Microservicios de Gestión de Mantenimiento Industrial y Predicción de Fallas mediante Inteligencia Artificial (CeroFallas AI)',
    )
    .setVersion('2.0.0')
    .addTag('Correctivos', 'Gestión y captura de tiempos muertos y fallas')
    .addTag('Preventivos', 'Programación y auditoría de mantenimientos preventivos')
    .addTag('Confiabilidad', 'Métricas de Ingeniería de Mantenimiento (MTBF, MTTR, Disponibilidad)')
    .addTag('Predictivo AI', 'Modelos de Machine Learning, Score de Riesgo y Alertas Tempranas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 CeroFallas Backend corriendo en: http://localhost:${PORT}/api`);
  console.log(`📄 Documentación Swagger disponible en: http://localhost:${PORT}/api/docs`);
}
bootstrap();
