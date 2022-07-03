import { EntityId } from '@libs/types';

export class RankingProfessionDto {
  profession: string;
  profit: number;

  constructor(params: Partial<RankingProfessionDto> = {}) {
    Object.assign(this, params);
  }
}
