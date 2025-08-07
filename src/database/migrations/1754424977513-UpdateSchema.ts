import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1754424977513 implements MigrationInterface {
    name = 'UpdateSchema1754424977513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disease_occurrence" DROP CONSTRAINT "FK_82297908232bd856dd6283a84cf"`);
        await queryRunner.query(`CREATE TABLE "disease_occurrence_diseases" ("disease_occurrence_id" uuid NOT NULL, "disease_id" uuid NOT NULL, CONSTRAINT "PK_1037d71025517cc40a53daa353c" PRIMARY KEY ("disease_occurrence_id", "disease_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f21844866c3d9480eab0728be0" ON "disease_occurrence_diseases" ("disease_occurrence_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d5e5b75e46b6732b78d1ec55e" ON "disease_occurrence_diseases" ("disease_id") `);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" DROP COLUMN "disease_id"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD "instructions" text`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD "is_patient_in_risk_group" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD "refer_usm" character varying`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence_diseases" ADD CONSTRAINT "FK_f21844866c3d9480eab0728be0f" FOREIGN KEY ("disease_occurrence_id") REFERENCES "disease_occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence_diseases" ADD CONSTRAINT "FK_3d5e5b75e46b6732b78d1ec55e2" FOREIGN KEY ("disease_id") REFERENCES "disease"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disease_occurrence_diseases" DROP CONSTRAINT "FK_3d5e5b75e46b6732b78d1ec55e2"`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence_diseases" DROP CONSTRAINT "FK_f21844866c3d9480eab0728be0f"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP COLUMN "refer_usm"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP COLUMN "is_patient_in_risk_group"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP COLUMN "instructions"`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" ADD "disease_id" uuid NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d5e5b75e46b6732b78d1ec55e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f21844866c3d9480eab0728be0"`);
        await queryRunner.query(`DROP TABLE "disease_occurrence_diseases"`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" ADD CONSTRAINT "FK_82297908232bd856dd6283a84cf" FOREIGN KEY ("disease_id") REFERENCES "disease"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
