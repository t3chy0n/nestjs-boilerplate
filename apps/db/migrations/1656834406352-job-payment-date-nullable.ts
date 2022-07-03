import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobPaymentDateNullable1656834406352 implements MigrationInterface {
  name = 'JobPaymentDateNullable1656834406352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job" ALTER COLUMN "paymentDate" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job" ALTER COLUMN "paymentDate" SET NOT NULL`,
    );
  }
}
