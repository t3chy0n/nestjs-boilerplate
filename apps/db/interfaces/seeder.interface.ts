export abstract class ISeeder {
  abstract createMany?(amount: number): Promise<any>;
  abstract seedProduction?(): Promise<any>;
  abstract createOne(defaultOptions: Record<string, any>): Promise<any>;
}
