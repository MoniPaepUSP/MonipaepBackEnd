import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1754940905627 implements MigrationInterface {
    name = 'UpdateSchema1754940905627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_bfa31f75b575df09a67bbae9cda"`);
        await queryRunner.query(`ALTER TABLE "vaccines" DROP CONSTRAINT "FK_8e114a21b4c292e705a7fd55c1a"`);
        await queryRunner.query(`ALTER TABLE "usm" DROP CONSTRAINT "PK_47be2cd21db53edc2d2a98451c3"`);
        await queryRunner.query(`ALTER TABLE "usm" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "usm" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usm" ADD CONSTRAINT "PK_47be2cd21db53edc2d2a98451c3" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "usm_id"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "usm_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vaccines" DROP COLUMN "usm_name"`);
        await queryRunner.query(`ALTER TABLE "vaccines" ADD "usm_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_bfa31f75b575df09a67bbae9cda" FOREIGN KEY ("usm_id") REFERENCES "usm"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "vaccines" ADD CONSTRAINT "FK_8e114a21b4c292e705a7fd55c1a" FOREIGN KEY ("usm_name") REFERENCES "usm"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vaccines" DROP CONSTRAINT "FK_8e114a21b4c292e705a7fd55c1a"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_bfa31f75b575df09a67bbae9cda"`);
        await queryRunner.query(`ALTER TABLE "vaccines" DROP COLUMN "usm_name"`);
        await queryRunner.query(`ALTER TABLE "vaccines" ADD "usm_name" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "usm_id"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "usm_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usm" DROP CONSTRAINT "PK_47be2cd21db53edc2d2a98451c3"`);
        await queryRunner.query(`ALTER TABLE "usm" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "usm" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usm" ADD CONSTRAINT "PK_47be2cd21db53edc2d2a98451c3" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "vaccines" ADD CONSTRAINT "FK_8e114a21b4c292e705a7fd55c1a" FOREIGN KEY ("usm_name") REFERENCES "usm"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_bfa31f75b575df09a67bbae9cda" FOREIGN KEY ("usm_id") REFERENCES "usm"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
