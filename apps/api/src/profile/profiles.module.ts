import { ConfigurationModule } from '@libs/configuration/configuration.module';
import { Module } from '@nestjs/common';
import { ProfilesController } from './controllers/profiles.controller';
import { LoggerModule } from '@libs/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesProviders } from './profiles.providers';
import { IProfilesService } from './interfaces/profiles-service.interface';
import { IProfilesMapper } from './interfaces/profiles-mapper.interface';
import { Profile } from './entities/profile.entity';
import { BalancesController } from '@app/profile/controllers/balances.controller';
import { LazyLoaderModule } from '@libs/lazy-loader/lazy-loader.module';

@Module({
  imports: [
    ConfigurationModule,
    LoggerModule,
    LazyLoaderModule.forRoot(),
    TypeOrmModule.forFeature([Profile]),
  ],
  controllers: [ProfilesController, BalancesController],
  providers: [...ProfilesProviders],
  exports: [IProfilesService, IProfilesMapper],
})
export class ProfilesModule {}
