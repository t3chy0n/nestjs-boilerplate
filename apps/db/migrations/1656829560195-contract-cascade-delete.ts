import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContractCascadeDelete1656829560195 implements MigrationInterface {
  name = 'ContractCascadeDelete1656829560195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_549fe94002a48f41e53ae210830"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_7a1cb157702ed3be7693c40b668"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_549fe94002a48f41e53ae210830" FOREIGN KEY ("clientId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_7a1cb157702ed3be7693c40b668" FOREIGN KEY ("contractorId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_7a1cb157702ed3be7693c40b668" FOREIGN KEY ("contractorId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_549fe94002a48f41e53ae210830" FOREIGN KEY ("clientId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
