import * as request from 'supertest';

import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { JobDto } from '@app/job/dto/job.dto';
import { EntityId } from '@libs/types';
import { HttpStatus } from '@nestjs/common';
import { JobsListFilterDto } from '@app/job/dto/request/jobs-list-filter.dto';
import { CreateJobDto } from '@app/job/dto/request/create-job.dto';
import { UpdateJobDto } from '@app/job/dto/request/update-job.dto';

export class JobsTestHttpClient {
  constructor(
    private readonly httpServer: any,
    private readonly accessToken: string = '',
  ) {}

  async findOne(
    id: EntityId = '',
    expectedStatus = HttpStatus.OK,
  ): Promise<JobDto> {
    const result = await request(this.httpServer)
      .get(`/jobs/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .expect(expectedStatus);

    return JSON.parse(result.text);
  }

  async findMany(
    filters: JobsListFilterDto,
    expectedStatus = HttpStatus.OK,
  ): Promise<PaginatedDataDto<JobDto>> {
    const result = await request(this.httpServer)
      .get('/jobs')
      .query(filters)
      .expect(expectedStatus);

    return JSON.parse(result.text);
  }

  async create(
    createData: CreateJobDto,
    expectedStatus = HttpStatus.CREATED,
  ): Promise<JobDto> {
    const result = await request(this.httpServer)
      .post('/jobs')
      .set('Authorization', `Bearer ${this.accessToken}`)
      .send(createData)
      .expect(expectedStatus);

    const response = JSON.parse(result.text);
    return response;
  }

  async update(
    id: EntityId,
    updateData: UpdateJobDto,
    expectedStatus = HttpStatus.OK,
  ): Promise<JobDto> {
    const response = await request(this.httpServer)
      .put(`/jobs/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .send(updateData)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }
  async delete(id: EntityId, expectedStatus = HttpStatus.OK) {
    const response = await request(this.httpServer)
      .delete(`/jobs/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }

  async payJob(id: EntityId, expectedStatus = HttpStatus.OK) {
    const response = await request(this.httpServer)
      .delete(`/jobs/${id}/pay`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }
}
