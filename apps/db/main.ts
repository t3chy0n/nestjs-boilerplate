import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeds/seeds.module';

const devSeeder = async (seeds: any[]) => {
  for await (const seed of seeds) {
    if (
      typeof seed.createMany === 'function' &&
      typeof seed.factory === 'function'
    ) {
      await seed.createMany(30);
    }

    if (typeof seed.seedProduction === 'function') {
      await seed.seedProduction();
    }
  }
};
const prodSeeder = async (seeds: any[]) => {
  for await (const seed of seeds) {
    if (typeof seed.seedProduction === 'function') {
      await seed.seedProduction();
    }
  }
};

/***
 * Bootstrap seeding application
 */
async function bootstrap() {
  const app = await NestFactory.create(SeederModule.forRoot());

  let seeds = [];
  let seeder;
  if (process.env.NODE_ENV == 'production') {
    seeds = app.get('SEEDS_PRODUCTION');

    seeder = prodSeeder;
  } else {
    seeds = app.get('SEEDS');
    seeder = devSeeder;
  }

  try {
    await seeder(seeds);
  } catch (error) {
    console.error(error.toString(), error.stack);
  }
}

bootstrap();
