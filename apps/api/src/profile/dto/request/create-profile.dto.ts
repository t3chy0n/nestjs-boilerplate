import { IsNumber, IsOptional, IsString } from 'class-validator';
import { HttpMethods } from '@libs/enums/http-methods.enum';
import { ProfileType } from '@app/profile/consts';

export class CreateProfileDto {
  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsString()
  firstName: string;

  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsString()
  lastName: string;

  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsString()
  profession: string;

  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsNumber()
  balance: number;

  @IsOptional({
    groups: [HttpMethods.PUT],
  })
  @IsString()
  type: ProfileType;

  constructor(params: Partial<CreateProfileDto> = {}) {
    Object.assign(this, params);
  }
}
