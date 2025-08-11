import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1754933418847 implements MigrationInterface {
    name = 'UpdateSchema1754933418847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usm" ADD "type" character varying`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" ALTER COLUMN "date_start" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disease_occurrence" ALTER COLUMN "date_start" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usm" DROP COLUMN "type"`);
    }

}
