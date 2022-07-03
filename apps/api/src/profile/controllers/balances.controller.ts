import { IBalancesController } from '../interfaces/balances-controller.interface';
import { EntityId } from '@libs/types';
import { ProfileDto } from '@app/profile/dto/profile.dto';
import { ApiTags } from '@nestjs/swagger';
import { MODULE_TAG } from '@app/profile/consts';
import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ProfileNotFoundException } from '@app/profile/exceptions/profile-not-found.exception';
import { UUID } from '@libs/decorators/uuid.decorator';
import { MakeDepositDto } from '@app/profile/dto/request/make-deposit.dto';
import { IProfilesMapper } from '@app/profile/interfaces/profiles-mapper.interface';
import { IBalancesService } from '@app/profile/interfaces/balances-service.interface';
import { CannotMakeDepositException } from '@app/profile/exceptions/cannot-make-deposit.exception';

@ApiTags(MODULE_TAG)
@Controller('balances')
@ApiException(() => InternalServerErrorException, {
  description: 'Something unexpected happened on server side',
})
export class BalancesController implements IBalancesController {
  constructor(
    private readonly service: IBalancesService,
    private readonly mapper: IProfilesMapper,
  ) {}

  /***
   * Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
   *
   */
  @Post('/deposit/:id')
  @ApiException(() => ProfileNotFoundException, {
    description: 'Profile was not not found',
  })
  @ApiException(() => CannotMakeDepositException, {
    description:
      'When total balance is bigger than 25% of clients total value of all jobs to pay',
  })
  async deposit(
    @UUID('id') id: EntityId,
    @Body() dto: MakeDepositDto,
  ): Promise<ProfileDto> {
    const criteria = this.mapper.toMakeDepositCriteria(id, dto);
    const result = await this.service.deposit(criteria);
    return this.mapper.toDto(result);
  }
}
