import { AnyConstructor } from '@libs/lazy-loader/types';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { PROXY_MODULE_ASSOCIATION } from '@libs/discovery/const';

export function BelongsTo(module: AnyConstructor<any>) {
  return applyDecorators(SetMetadata(PROXY_MODULE_ASSOCIATION, module));
}
