export class RequestContextDto {
  requestId?: string = '';
  requestMethod?: string;
  session?: any;
  lastSpans?: any[] = []
}
