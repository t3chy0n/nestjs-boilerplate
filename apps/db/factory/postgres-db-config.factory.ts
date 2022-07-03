import { IConfiguration } from '@libs/configuration/interfaces/configuration.interface';
import { Config } from '@libs/configuration/config.map';
import { MigrationsProvider } from '../migrations.provider';
import { Entities } from '../const';
import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class PostgresDBConfigurationFactory {
  constructor(private readonly config: IConfiguration) {}
  isReplicationEnabled() {
    return !!this.config.get(Config.Db.Replication, false);
  }

  getSingleInstanceConfig(): object {
    return {
      type: this.config.get<any>(Config.Db.Type, 'postgres'),
      host: this.config.get<string>(Config.Db.Host, 'localhost'),
      port: this.config.get<number>(Config.Db.Port, 5432),
      username: this.config.get<string>(Config.Db.Username),
      password: this.config.get<string>(Config.Db.Password),
      database: this.config.get<string>(Config.Db.Database),
    };
  }

  getReplicationConfig(): object {
    return this.config.get(Config.Db.Replication);
  }

  create() {
    return {
      type: this.config.get<any>(Config.Db.Type, 'postgres'),
      ...(this.isReplicationEnabled()
        ? this.getReplicationConfig()
        : this.getSingleInstanceConfig()),
      entities: Entities,
      synchronize: false,
      migrations: [...MigrationsProvider],
      migrationsTableName: 'migrations_typeorm',
      migrationsRun: this.config.get<boolean>(Config.Db.RunMigrations, true),
      autoLoadEntities: false,
      // bigNumberStrings: false,
      logging: this.config.get<boolean>(Config.Db.RunMigrations, false),
    };
  }
}
