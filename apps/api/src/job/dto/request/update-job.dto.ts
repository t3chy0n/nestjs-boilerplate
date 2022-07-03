import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  constructor(params: Partial<UpdateJobDto> = {}) {
    super(params);
    Object.assign(this, params);
  }
}
