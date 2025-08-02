import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1752706142977 implements MigrationInterface {
    name = 'UpdateSchema1752706142977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "health_protocols_symptoms" ("health_protocol_id" uuid NOT NULL, "symptom_id" uuid NOT NULL, CONSTRAINT "PK_27de33df30c44d2d7b6c30b8fc2" PRIMARY KEY ("health_protocol_id", "symptom_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4dd72fa207a1b25130fb369049" ON "health_protocols_symptoms" ("health_protocol_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d20f1404b3a1547212a912fdea" ON "health_protocols_symptoms" ("symptom_id") `);
        await queryRunner.query(`ALTER TABLE "health_protocol" DROP COLUMN "severity"`);
        await queryRunner.query(`ALTER TABLE "health_protocol" ADD "gravity_level" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_protocol" ADD "gravity_label" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "health_protocols_symptoms" ADD CONSTRAINT "FK_4dd72fa207a1b25130fb3690496" FOREIGN KEY ("health_protocol_id") REFERENCES "health_protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "health_protocols_symptoms" ADD CONSTRAINT "FK_d20f1404b3a1547212a912fdea1" FOREIGN KEY ("symptom_id") REFERENCES "symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_protocols_symptoms" DROP CONSTRAINT "FK_d20f1404b3a1547212a912fdea1"`);
        await queryRunner.query(`ALTER TABLE "health_protocols_symptoms" DROP CONSTRAINT "FK_4dd72fa207a1b25130fb3690496"`);
        await queryRunner.query(`ALTER TABLE "health_protocol" DROP COLUMN "gravity_label"`);
        await queryRunner.query(`ALTER TABLE "health_protocol" DROP COLUMN "gravity_level"`);
        await queryRunner.query(`ALTER TABLE "health_protocol" ADD "severity" character varying NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d20f1404b3a1547212a912fdea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4dd72fa207a1b25130fb369049"`);
        await queryRunner.query(`DROP TABLE "health_protocols_symptoms"`);
    }

}
