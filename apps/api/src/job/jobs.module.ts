import { ConfigurationModule } from '@libs/configuration/configuration.module';
import { Module } from '@nestjs/common';
import { JobsController } from './controllers/jobs.controller';
import { LoggerModule } from '@libs/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsProviders } from './jobs.providers';
import { IJobsService } from './interfaces/jobs-service.interface';
import { IJobsMapper } from './interfaces/jobs-mapper.interface';
import { Job } from './entities/job.entity';
import { LazyLoaderModule } from '@libs/lazy-loader/lazy-loader.module';
import { AdminController } from '@app/job/controllers/admin.controller';

@Module({
  imports: [
    ConfigurationModule,
    LoggerModule,
    LazyLoaderModule.forRoot(),
    TypeOrmModule.forFeature([Job]),
  ],
  controllers: [JobsController, AdminController],
  providers: [...JobsProviders],
  exports: [IJobsService, IJobsMapper],
})
export class JobsModule {}
