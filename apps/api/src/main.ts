import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Converter from 'openapi-to-postmanv2';
import { IConfiguration } from '@libs/configuration/interfaces/configuration.interface';
import { ILogger } from '@libs/logger/logger.interface';
import { RequestScopedValidationPipe } from '@libs/validation/validation.pipe';
import { LoggerInterceptor } from '@libs/logger/logger.interceptor';
import { HttpExceptionFilter } from '@libs/exceptions/http-exception.filter';
import { IHttpExceptionFilter } from '@libs/exceptions/interfaces/http-exception-filter.interface';

import { moduleAutoMatch } from '@libs/discovery/utils';

const PORT_CONFIG_PATH = 'port';

async function bootstrap() {
  const isDevMode = process.env.NODE_ENV !== 'production';
  moduleAutoMatch();
  const app = await NestFactory.create(AppModule);
  const config = await app.resolve<IConfiguration>(IConfiguration);

  // const config = await app.resolve<IBootstrapConfiguration>(
  //   IBootstrapConfiguration,
  // );

  const logger = await app.resolve<ILogger>(ILogger);

  const validationPipe = app.get<RequestScopedValidationPipe>(
    RequestScopedValidationPipe,
  );

  app.useGlobalPipes(validationPipe);

  const exceptionFilter = app.get<IHttpExceptionFilter>(IHttpExceptionFilter);

  app.useGlobalFilters(exceptionFilter);
  const logInterceptor = await app.resolve<LoggerInterceptor>(
    LoggerInterceptor,
  );
  app.useGlobalInterceptors(logInterceptor);
  const port = config.get<number>(PORT_CONFIG_PATH);
  logger.log(`Listening on port ${port}`);
  if (isDevMode) {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('')
      .setVersion('0.0.1')
      .addTag('api')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    // Write to swagger to filesystem
    const documentString = JSON.stringify(document);
    writeFileSync('docs/swagger.json', documentString, {
      encoding: 'utf8',
    });

    Converter.convert(
      { type: 'string', data: documentString },
      {},
      (err, conversionResult) => {
        if (!conversionResult.result) {
          console.log('Could not convert', conversionResult.reason);
        } else {
          writeFileSync(
            'docs/collection.json',
            JSON.stringify(conversionResult.output[0].data),
            {
              encoding: 'utf8',
            },
          );
        }
      },
    );
  }

  await app.listen(port);
}
bootstrap();
