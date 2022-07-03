import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateContractsRelation1656791045333
  implements MigrationInterface
{
  name = 'UpdateContractsRelation1656791045333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_549fe94002a48f41e53ae210830"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_7a1cb157702ed3be7693c40b668"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "clientId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "REL_549fe94002a48f41e53ae21083"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "REL_7a1cb157702ed3be7693c40b66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_549fe94002a48f41e53ae210830" FOREIGN KEY ("clientId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_7a1cb157702ed3be7693c40b668" FOREIGN KEY ("contractorId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_7a1cb157702ed3be7693c40b668"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_549fe94002a48f41e53ae210830"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "REL_7a1cb157702ed3be7693c40b66" UNIQUE ("contractorId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "REL_549fe94002a48f41e53ae21083" UNIQUE ("clientId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "clientId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_7a1cb157702ed3be7693c40b668" FOREIGN KEY ("contractorId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_549fe94002a48f41e53ae210830" FOREIGN KEY ("clientId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
