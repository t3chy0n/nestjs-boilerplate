import * as request from 'supertest';

import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ContractsListFilterDto } from '@app/contract/dto/request/contracts-list-filter.dto';
import { CreateContractDto } from '@app/contract/dto/request/create-contract.dto';
import { EntityId } from '@libs/types';
import { HttpStatus } from '@nestjs/common';
import { ProfileDto } from '@app/profile/dto/profile.dto';
import { UpdateProfileDto } from '@app/profile/dto/request/update-profile.dto';
import { CreateProfileDto } from '@app/profile/dto/request/create-profile.dto';

export class ProfilesTestHttpClient {
  constructor(
    private readonly httpServer: any,
    private readonly accessToken: string = '',
  ) {}

  async findOne(
    id: EntityId = '',
    expectedStatus = HttpStatus.OK,
  ): Promise<ProfileDto> {
    const res = await request(this.httpServer)
      .get(`/profiles/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .expect(expectedStatus);

    return JSON.parse(res.text);
  }

  async findMany(
    filters: ContractsListFilterDto = {},
    expectedStatus = HttpStatus.OK,
  ): Promise<PaginatedDataDto<ProfileDto>> {
    const response = await request(this.httpServer)
      .get('/profiles')
      .query(filters)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .expect(expectedStatus);

    const res = JSON.parse(response.text);
    return res;
  }

  async create(
    createData: CreateProfileDto,
    expectedStatus = HttpStatus.CREATED,
  ): Promise<ProfileDto> {
    const result = await request(this.httpServer)
      .post('/profiles')
      .set('Authorization', `Bearer ${this.accessToken}`)
      .send(createData)
      .expect(expectedStatus);

    const response = JSON.parse(result.text);
    return response;
  }

  async update(
    id: EntityId,
    updateData: UpdateProfileDto,
    expectedStatus = HttpStatus.OK,
  ): Promise<ProfileDto> {
    const response = await request(this.httpServer)
      .put(`/profiles/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .send(updateData)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }
  async delete(id: EntityId, expectedStatus = HttpStatus.OK) {
    const response = await request(this.httpServer)
      .delete(`/profiles/${id}`)
      .set('Authorization', `Bearer ${this.accessToken}`)
      .expect(expectedStatus);

    return JSON.parse(response.text);
  }
}
