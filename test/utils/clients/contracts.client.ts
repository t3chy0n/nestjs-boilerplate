import * as request from 'supertest';

import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ContractsListFilterDto } from '@app/contract/dto/request/contracts-list-filter.dto';
import { CreateContractDto } from '@app/contract/dto/request/create-contract.dto';
import { ContractDto } from '@app/contract/dto/contract.dto';
import { UpdateContractDto } from '@app/contract/dto/request/update-contract.dto';
import { EntityId } from '@libs/types';
import { HttpStatus } from '@nestjs/common';

export class ContractsTestHttpClient {
  constructor(
    private readonly httpServer: any,
    private readonly accessToken: string = '',
  ) {}

  async findOne(
    id: EntityId = '',
    expectedStatus = HttpStatus.OK,
  ): Promise<ContractDto> {
    const response = await request(this.httpServer)
      .get(`/contracts/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .set('profile_id', `9ce69bb9-2adf-4439-ac15-82a96b8b7a6d`)
      .set('role', `admin`)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }

  async findMany(
    filters: ContractsListFilterDto = {},
    expectedStatus = HttpStatus.OK,
  ): Promise<PaginatedDataDto<ContractDto>> {
    const response = await request(this.httpServer)
      .get('/contracts')
      .query(filters)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .set('profile_id', `9ce69bb9-2adf-4439-ac15-82a96b8b7a6d`)
      .set('role', `admin`)

      .expect(expectedStatus);

    const res = JSON.parse(response.text);
    return res;
  }

  async create(
    createData: CreateContractDto,
    expectedStatus = HttpStatus.CREATED,
  ): Promise<ContractDto> {
    const result = await request(this.httpServer)
      .post('/contracts')
      .set('Authorization', `Bearer ${this.accessToken}`)
      .set('profile_id', `9ce69bb9-2adf-4439-ac15-82a96b8b7a6d`)
      .set('role', `admin`)
      .send(createData)
      .expect(expectedStatus);

    return JSON.parse(result.text);
  }

  async update(
    id: EntityId,
    updateData: UpdateContractDto,
    expectedStatus = HttpStatus.OK,
  ) {
    const response = await request(this.httpServer)
      .put(`/contracts/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .set('profile_id', `9ce69bb9-2adf-4439-ac15-82a96b8b7a6d`)
      .set('role', `admin`)
      .send(updateData)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }
  async delete(id: EntityId, expectedStatus = HttpStatus.OK) {
    const response = await request(this.httpServer)
      .delete(`/contracts/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .set('profile_id', `9ce69bb9-2adf-4439-ac15-82a96b8b7a6d`)
      .set('role', `admin`)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }
}
