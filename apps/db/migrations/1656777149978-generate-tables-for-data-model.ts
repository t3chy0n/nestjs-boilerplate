import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateTablesForDataModel1656777149978
  implements MigrationInterface
{
  name = 'GenerateTablesForDataModel1656777149978';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "job"
        (
            "createdAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "description" character varying NOT NULL,
            "price"       integer           NOT NULL,
            "paid"        boolean           NOT NULL DEFAULT false,
            "paymentDate" TIMESTAMP WITH TIME ZONE NOT NULL,
            "contractId" uuid,
            CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id")
        );

    `);
    await queryRunner.query(`
        CREATE TABLE "profile"
        (
            "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "firstName"  character varying NOT NULL,
            "lastName"   character varying NOT NULL,
            "profession" character varying NOT NULL,
            "balance"    numeric(12, 2)    NOT NULL DEFAULT '0',
            "type"       character varying NOT NULL,
            CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id")
        );
    `);
    await queryRunner.query(`
 
        CREATE TABLE "contract"
        (
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "terms"     character varying NOT NULL,
            "status"    character varying NOT NULL DEFAULT 'new',
            "clientId" uuid NOT NULL,
            "contractorId" uuid,
            CONSTRAINT "REL_549fe94002a48f41e53ae21083" UNIQUE ("clientId"),
            CONSTRAINT "REL_7a1cb157702ed3be7693c40b66" UNIQUE ("contractorId"),
            CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id")
        );
   
    `);
    await queryRunner.query(
      `ALTER TABLE "job" ADD CONSTRAINT "FK_6206deb3a929e8fcaa28427964a" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "job" DROP CONSTRAINT "FK_6206deb3a929e8fcaa28427964a"`,
    );
    await queryRunner.query(`DROP TABLE "contract"`);
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TABLE "job"`);
  }
}
