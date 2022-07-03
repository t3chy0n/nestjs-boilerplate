import { MigrationInterface, QueryRunner } from 'typeorm';

export class Extensions1649348055090 implements MigrationInterface {
  name = 'Extensions1649348055090';

  /***
   * Ensure postgress extensions are installed
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp" ;
    `);
  }

  /***
   * No need to delete them
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
