import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobCascadeDelete1656791994250 implements MigrationInterface {
  name = 'JobCascadeDelete1656791994250';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job" DROP CONSTRAINT "FK_6206deb3a929e8fcaa28427964a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job" ADD CONSTRAINT "FK_6206deb3a929e8fcaa28427964a" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job" DROP CONSTRAINT "FK_6206deb3a929e8fcaa28427964a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job" ADD CONSTRAINT "FK_6206deb3a929e8fcaa28427964a" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
