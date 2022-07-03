export abstract class IDaoFactory<TDao> {
  abstract create(): Promise<TDao>;
}
