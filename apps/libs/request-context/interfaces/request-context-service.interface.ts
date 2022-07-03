import { RequestContextDto } from '../request-context.dto';

/***
 * Interfaces for interacting with request context
 */
export abstract class IRequestContextService {
  abstract getContext(): RequestContextDto;
  abstract updateContext(ctx: RequestContextDto);
}
