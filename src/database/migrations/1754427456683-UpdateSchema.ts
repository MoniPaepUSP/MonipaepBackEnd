import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1754427456683 implements MigrationInterface {
    name = 'UpdateSchema1754427456683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "house_number"`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "house_number" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "house_number"`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "house_number" integer NOT NULL`);
    }

}
