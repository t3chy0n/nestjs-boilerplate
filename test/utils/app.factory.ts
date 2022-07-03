import { Entities } from '@db/const';

import { MigrationsProvider } from '@db/migrations.provider';
import { StartedTestContainer } from 'testcontainers/dist/test-container';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Test } from '@nestjs/testing';
import { ConfigurationModule } from '@libs/configuration/configuration.module';
import { SeederModule } from '@db/seeds/seeds.module';
import { RequestScopedValidationPipe } from '@libs/validation/validation.pipe';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { INestApplication } from '@nestjs/common';
import { RequestContextModule } from '@libs/request-context/request-context.module';

import { LoggerModule } from '@libs/logger/logger.module';
import { HttpModule, HttpService } from '@nestjs/axios';
import { HttpMockClient } from './http-mock.client';
import { ExceptionsModule } from '@libs/exceptions/exceptions.module';
import { IHttpExceptionFilter } from '@libs/exceptions/interfaces/http-exception-filter.interface';
import faker from '@faker-js/faker';
import { getPostgresContainer } from './postgress.testcontainers';
import { LazyLoaderModule } from '@libs/lazy-loader/lazy-loader.module';

const POSTGRES_PORT = 5432;

export const testPostgresContainer = async () => {
  return await getPostgresContainer(POSTGRES_PORT);
};

export const testDbFactory = (
  container: StartedTestContainer,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: container.getHost(),
    port: container.getMappedPort(POSTGRES_PORT),
    username: 'root',
    password: 'admin',
    database: 'boilerplate',
    synchronize: false,
    entities: [...Entities],
    migrations: [...MigrationsProvider],
    migrationsTableName: 'migrations_typeorm',
    migrationsRun: true,
    autoLoadEntities: false,
    logging: false,
  };
};

export async function seedDb(app: INestApplication) {
  try {
    const seeds: any[] = app.get('SEEDS');

    for (const seed of seeds) {
      try {
        await seed.createMany(15);

        if (typeof seed.seedProduction === 'function') {
          await seed.seedProduction();
        }
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export const testAppFactory = async (
  options: ModuleMetadata,
): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      HttpModule,
      RequestContextModule,
      LoggerModule.forTests(false),
      LazyLoaderModule.forRoot(),
      ConfigurationModule.forTests(),
      SeederModule.forE2ETests(),
      ExceptionsModule.forRoot(),

      ...options.imports,
    ],

    providers: [RequestScopedValidationPipe, ...options.providers],
  })
    .overrideProvider(HttpService)
    .useValue(new HttpMockClient())
    .compile();

  const app = moduleFixture.createNestApplication();
  const validationPipe = app.get<RequestScopedValidationPipe>(
    RequestScopedValidationPipe,
  );
  app.useGlobalPipes(validationPipe);
  const exceptionFilter = app.get<IHttpExceptionFilter>(IHttpExceptionFilter);

  app.useGlobalFilters(exceptionFilter);

  try {
    await app.init();
    await seedDb(app);
  } catch (err) {
    console.error(err);
  }
  return app;
};
