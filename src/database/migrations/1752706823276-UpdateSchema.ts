import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1752706823276 implements MigrationInterface {
    name = 'UpdateSchema1752706823276'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_protocol" ADD "referToUSM" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_protocol" DROP COLUMN "referToUSM"`);
    }

}
