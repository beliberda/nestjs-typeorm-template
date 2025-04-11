import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "src/app.module";

async function start() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  // настройка swaggera

  const config = new DocumentBuilder()
    .setTitle("Кибер котлеты")
    .setDescription("backend configuration for cyber kotletki server")
    .setVersion("1.0.0")
    .addTag("auf")
    .build();

  // подключаем swagger к приложению и указываем путь к документации
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);
  app.enableCors({
    origin: [
      "http://localhost:5173",
      "https://pwa.hrmny.pena.digital",
      "https://www.pwa.hrmny.pena.digital",
    ], // Разрешённые источники
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Разрешённые методы
    allowedHeaders: "Content-Type, Authorization", // Разрешённые заголовки
    credentials: true, // Если используется куки
  });
  await app.listen(PORT, () => console.log(`Server started on ${PORT}`));
}
start();
