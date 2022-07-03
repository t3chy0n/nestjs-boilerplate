import * as request from 'supertest';

import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { JobDto } from '@app/job/dto/job.dto';
import { ContractDto } from '@app/contract/dto/contract.dto';
import { UpdateContractDto } from '@app/contract/dto/request/update-contract.dto';
import { EntityId } from '@libs/types';
import { HttpStatus } from '@nestjs/common';
import { JobsListFilterDto } from '@app/job/dto/request/jobs-list-filter.dto';
import { CreateJobDto } from '@app/job/dto/request/create-job.dto';
import { UpdateJobDto } from '@app/job/dto/request/update-job.dto';
import { DateRangeFilterDto } from '@app/job/dto/request/date-range-filter.dto';
import { ProfileDto } from '@app/profile/dto/profile.dto';
import { RankingProfessionDto } from '@app/job/dto/ranking-profession.dto';

export class AdminTestHttpClient {
  constructor(
    private readonly httpServer: any,
    private readonly accessToken: string = '',
  ) {}

  async bestClients(
    filters: DateRangeFilterDto,
    expectedStatus = HttpStatus.OK,
  ): Promise<PaginatedDataDto<ProfileDto>> {
    const result = await request(this.httpServer)
      .get(`/admin/best-clients`)
      .query(filters)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .expect(expectedStatus);

    return JSON.parse(result.text);
  }

  async bestProfession(
    filters: DateRangeFilterDto,
    expectedStatus = HttpStatus.OK,
  ): Promise<PaginatedDataDto<RankingProfessionDto>> {
    const result = await request(this.httpServer)
      .get('/admin/best-profession')
      .query(filters)
      .expect(expectedStatus);

    return JSON.parse(result.text);
  }
}
