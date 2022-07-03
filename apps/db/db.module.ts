import { Global, Module } from '@nestjs/common';
import { PostgresDBConfigurationFactory } from './factory/postgres-db-config.factory';

@Global()
@Module({
  providers: [PostgresDBConfigurationFactory],
  exports: [PostgresDBConfigurationFactory],
})
export class DbModule {}
