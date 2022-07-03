import { ConfigurationModule } from '@libs/configuration/configuration.module';
import { Module } from '@nestjs/common';
import { ContractController } from './controllers/contract.controller';
import { LoggerModule } from '@libs/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsProviders } from './contracts.providers';
import { IContractsService } from './interfaces/contracts-service.interface';
import { IContractsMapper } from './interfaces/contracts-mapper.interface';
import { Contract } from './entities/contract.entity';
import { LazyLoaderModule } from '@libs/lazy-loader/lazy-loader.module';

@Module({
  imports: [
    ConfigurationModule,
    LoggerModule,
    LazyLoaderModule.forRoot(),
    TypeOrmModule.forFeature([Contract]),
  ],
  controllers: [ContractController],
  providers: [...ContractsProviders],
  exports: [IContractsService, IContractsMapper],
})
export class ContractsModule {}
