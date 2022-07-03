import { EntityId } from '@libs/types';
import { Column } from 'typeorm';
import { ProfileType } from '@app/profile/consts';

export class ProfileDto {
  id: EntityId;

  firstName: string;

  lastName: string;

  profession: string;

  balance: number;

  type: ProfileType;

  createdAt: Date;
  updatedAt: Date;

  constructor(params: Partial<ProfileDto> = {}) {
    Object.assign(this, params);
  }
}
