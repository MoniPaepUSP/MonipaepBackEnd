import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1755029622422 implements MigrationInterface {
    name = 'UpdateSchema1755029622422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP CONSTRAINT "FK_e7170b8270d8b4f2fef34c387de"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP COLUMN "chat"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP COLUMN "probable_diseases"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD CONSTRAINT "FK_e7170b8270d8b4f2fef34c387de" FOREIGN KEY ("disease_occurrence_id") REFERENCES "disease_occurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP CONSTRAINT "FK_e7170b8270d8b4f2fef34c387de"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD "probable_diseases" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD "chat" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD CONSTRAINT "FK_e7170b8270d8b4f2fef34c387de" FOREIGN KEY ("disease_occurrence_id") REFERENCES "disease_occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
