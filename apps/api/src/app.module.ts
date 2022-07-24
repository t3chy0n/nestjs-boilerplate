import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from '@db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresDBConfigurationFactory } from '@db/factory/postgres-db-config.factory';
import { JobsModule } from '@app/job/jobs.module';
import { ContractsModule } from '@app/contract/contracts.module';
import { ProfilesModule } from '@app/profile/profiles.module';
import { RequestScopedValidationPipe } from '@libs/validation/validation.pipe';
import { RequestContextModule } from '@libs/request-context/request-context.module';
import { ExceptionsModule } from '@libs/exceptions/exceptions.module';
import * as path from 'path';

import { ServeStaticModule } from '@nestjs/serve-static';
import { MessagingModule } from '@libs/messaging/messaging.module';
import { TradesService } from '@app/trades.service';
import { FlinkFunctionsModule } from '@libs/flink/flink-functions.installer';

const modules = [
  DbModule,
  FlinkFunctionsModule,
  MessagingModule.forRoot(),
  RequestContextModule,
  ExceptionsModule.forRoot(),
  TypeOrmModule.forRootAsync({
    useFactory: (factory: PostgresDBConfigurationFactory) => factory.create(),
    inject: [PostgresDBConfigurationFactory],
  }),
  JobsModule,
  ContractsModule,
  ProfilesModule,
];

if (process.env.NODE_ENV !== 'production') {
  modules.push(
    ServeStaticModule.forRoot({
      serveRoot: '/wiki',
      rootPath: path.join(__dirname, '../../../', 'docs-gen/build/site'),
    }),
  );
  modules.push(
    ServeStaticModule.forRoot({
      serveRoot: '/collection',
      rootPath: path.join(__dirname, '../../../', 'docs/collection.json'),
    }),
  );
}

@Module({
  imports: modules,
  controllers: [AppController],
  providers: [AppService, RequestScopedValidationPipe, TradesService],
})
export class AppModule {}
