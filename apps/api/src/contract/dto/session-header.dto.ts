import { EntityId } from '@libs/types';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@app/contract/consts';

export class SessionHeaderDto {
  @IsUUID()
  public profile_id: EntityId;

  @IsOptional()
  @IsEnum(Role)
  public role?: Role;

  constructor(params: Partial<SessionHeaderDto> = {}) {
    Object.assign(this, params);
  }
}
