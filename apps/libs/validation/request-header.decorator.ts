import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  ClassConstructor,
  classToPlainFromExist,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { validateOrReject } from 'class-validator';

export const RequestHeader = createParamDecorator(
  async (value: ClassConstructor<unknown>, ctx: ExecutionContext) => {
    // extract headers
    const headers = ctx.switchToHttp().getRequest().headers;

    const init = new value();
    // Convert headers to DTO object
    const dto: any = classToPlainFromExist(init, headers, {
      excludeExtraneousValues: true,
    });

    // Validate
    await validateOrReject(dto);

    // return header dto object
    return dto;
  },
);
