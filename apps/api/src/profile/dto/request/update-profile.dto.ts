import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  constructor(params: Partial<UpdateProfileDto> = {}) {
    super(params);
    Object.assign(this, params);
  }
}
