import { Config } from '@libs/configuration/config.map';
import { ConfigurationModule } from '@libs/configuration/configuration.module';
import { IConfiguration } from '@libs/configuration/interfaces/configuration.interface';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities } from '@db/const';

import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { DataSeed } from '@db/seeds/data.seed';

const Seeds = [DataSeed];

const SeedsProduction = [];

@Module({})
export class SeederModule {
  static forRoot(): DynamicModule {
    return {
      module: SeederModule,
      imports: [
        ConfigurationModule,

        TypeOrmModule.forRootAsync({
          useFactory: (config: IConfiguration) =>
            ({
              autoLoadEntities: false,
              type: config.get(Config.Db.Type, 'postgres'),
              host: config.get(Config.Db.Host, 'localhost'),
              port: config.get(Config.Db.Port, 5432),
              username: config.get(Config.Db.Username, 'root'),
              password: config.get(Config.Db.Password, 'admin'),
              database: config.get(Config.Db.Database),
              entities: Entities,
              synchronize: false,
              migrations: ['dist/db/migrations/*{.ts,.js}'],
              migrationsTableName: 'migrations_typeorm',
              migrationsRun: true,
            } as TypeOrmModuleOptions),
          inject: [IConfiguration],
        }),
        TypeOrmModule.forFeature(Entities),
      ],
      providers: [
        ...Seeds,
        {
          provide: 'SEEDS',
          useFactory: (...seeds) => seeds,
          inject: [...Seeds],
        },
        {
          provide: 'SEEDS_PRODUCTION',
          useFactory: (...seeds) => seeds,
          inject: [...SeedsProduction],
        },
      ],
    };
  }

  static forE2ETests(): DynamicModule {
    return {
      module: SeederModule,
      imports: [ConfigurationModule, TypeOrmModule.forFeature(Entities)],
      providers: [
        ...Seeds,
        {
          provide: 'SEEDS',
          useFactory: (...seeds) => seeds,
          inject: [...Seeds],
        },
      ],
    };
  }
}
