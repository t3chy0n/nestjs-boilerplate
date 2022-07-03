import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as fs from 'fs';
import * as yaml from 'yaml';

const file = fs.readFileSync('config/application.yaml', 'utf8');
const config = yaml.parse(file);

const options: PostgresConnectionOptions = {
  type: 'postgres',
  entities: ['apps/**/*.entity{.ts,.js}'],
  migrations: ['apps/api/src/db/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
  migrationsRun: true,
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
};
const sourceFactory = () => new DataSource(options);
const source = sourceFactory();

export default source;
