export abstract class ITracing {
  abstract startActiveSpan(name: string, cb: (span: any) => unknown);
  abstract initialize();
}
