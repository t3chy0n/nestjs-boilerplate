import { createParamDecorator, ExecutionContext, Param } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InvalidRecordIdException } from '../exceptions/invalid-record-id.exception';

export const ToUUID = createParamDecorator(
  async (property: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const uuid = req.params[property];

    if (!isUUID(uuid)) {
      throw new InvalidRecordIdException().params({ uuid, property });
    }

    return uuid;
  },
);

export function UUID(property: string) {
  return function (target: any, propertyKey: string, index: number) {
    ToUUID(property)(target, propertyKey, index);
    Param(property)(target, propertyKey, index);
  };
}
