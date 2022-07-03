import { UpdateContractDto } from '../dto/request/update-contract.dto';
import { PaginatedDataDto } from '@libs/dto/pagination/paginated-data.dto';
import { ApiPaginatedResponse } from '@libs/utils/swagger/api-paginated-response';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  InternalServerErrorException,
  Optional,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

import { ContractDto } from '../dto/contract.dto';
import { ContractsListFilterDto } from '../dto/request/contracts-list-filter.dto';
import { MODULE_TAG } from '../consts';
import { IContractsController } from '../interfaces/contracts-controller.interface';
import { IContractsService } from '../interfaces/contracts-service.interface';
import { IContractsMapper } from '../interfaces/contracts-mapper.interface';
import { ContractCriteria } from '../dto/criteria/contract-criteria.dto';
import { CreateContractDto } from '../dto/request/create-contract.dto';
import { EntityId } from '@libs/types';
import { UUID } from '@libs/decorators/uuid.decorator';
import { ContractNotFoundException } from '../exceptions/contract-not-found.exception';
import { ProfileNotFoundException } from '@app/profile/exceptions/profile-not-found.exception';
import { ContractProfileGuard } from '@app/contract/guard/contract-profile.guard';
import { SessionHeaderDto } from '@app/contract/dto/session-header.dto';
import { RequestHeader } from '@libs/validation/request-header.decorator';

@ApiTags(MODULE_TAG)
@Controller('contracts')
@ApiException(() => InternalServerErrorException, {
  description: 'Something unexpected happened on server side',
})
export class ContractController implements IContractsController {
  constructor(
    private readonly service: IContractsService,
    private readonly mapper: IContractsMapper,
  ) {}

  /***
   * Returns a single contracts details by its id, it allows only to view contracts
   * of a particular user, that is passed through profile_id in headers
   *
   * @example /contracts/123
   */
  @Get(':id')
  @UseGuards(ContractProfileGuard)
  @ApiException(() => ContractNotFoundException, {
    description: 'Contract was not not found',
  })
  @ApiException(() => ForbiddenException, {
    description: 'When profile_id is not present in headers',
  })
  async get(
    @RequestHeader(SessionHeaderDto) session: SessionHeaderDto,
    @UUID('id') id: EntityId,
  ): Promise<ContractDto> {
    const criteria = new ContractCriteria({ id });

    const result = await this.service.get(criteria, session);
    return this.mapper.toDto(result);
  }

  /***
   * Returns paginated results of contracts, it allows only to view contracts
   * of a particular user, that is passed through profile_id in headers
   *
   * @example /contracts?page=1&limit=10&ids=1,2,3
   */
  @Get()
  @UseGuards(ContractProfileGuard)
  @ApiPaginatedResponse(ContractDto)
  @ApiException(() => ForbiddenException, {
    description: 'When profile_id is not present in headers',
  })
  async findMany(
    @RequestHeader(SessionHeaderDto) session: SessionHeaderDto,
    @Query() filters?: ContractsListFilterDto,
  ): Promise<PaginatedDataDto<ContractDto>> {
    const criteria = this.mapper.toCriteria(filters);

    const list = await this.service.findMany(criteria, session);
    return this.mapper.toPaginatedDto(list);
  }

  /***
   * Creates a new contracts
   *
   * @param data
   */
  @Post()
  @ApiException(() => BadRequestException, {
    description: 'Invalid data was passed in request body',
  })
  @ApiException(() => ProfileNotFoundException, {
    description: 'Client or Contractor profile was not not found',
  })
  async create(@Body() data: CreateContractDto): Promise<ContractDto> {
    const result = await this.service.create(data);
    return this.mapper.toDto(result);
  }

  /***
   * Updates existing contracts definition
   *
   * @param id
   * @param updateData
   */
  @Put(':id')
  @ApiException(() => BadRequestException, {
    description: 'Invalid data was passed in request body',
  })
  async update(
    @UUID('id') id: string,
    @Body() updateData: UpdateContractDto,
  ): Promise<ContractDto> {
    const result = await this.service.update(id, updateData);
    return this.mapper.toDto(result);
  }

  /***
   * Deletes contract with a given id
   *
   * @param id
   */
  @Delete(':id')
  @ApiException(() => ContractNotFoundException, {
    description: 'Contract not found',
  })
  async delete(@UUID('id') id: string): Promise<boolean> {
    return await this.service.delete(id);
  }
}
