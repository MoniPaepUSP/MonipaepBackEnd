import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1752706868535 implements MigrationInterface {
    name = 'UpdateSchema1752706868535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_protocol" RENAME COLUMN "referToUSM" TO "refer_usm"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_protocol" RENAME COLUMN "refer_usm" TO "referToUSM"`);
    }

}
