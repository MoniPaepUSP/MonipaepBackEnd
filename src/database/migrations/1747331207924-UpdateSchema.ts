import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1747331207924 implements MigrationInterface {
    name = 'UpdateSchema1747331207924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "disease_key_symptom" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "weight" double precision NOT NULL, "disease_id" uuid, "symptom_id" uuid, CONSTRAINT "PK_0d667e66f620a29b1b345c468bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "disease_key_symptom" ADD CONSTRAINT "FK_ac2b2fb7c05c4e280903735fbf7" FOREIGN KEY ("disease_id") REFERENCES "disease"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "disease_key_symptom" ADD CONSTRAINT "FK_07b7fca2938a49d1e01320aaa44" FOREIGN KEY ("symptom_id") REFERENCES "symptom"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disease_key_symptom" DROP CONSTRAINT "FK_07b7fca2938a49d1e01320aaa44"`);
        await queryRunner.query(`ALTER TABLE "disease_key_symptom" DROP CONSTRAINT "FK_ac2b2fb7c05c4e280903735fbf7"`);
        await queryRunner.query(`DROP TABLE "disease_key_symptom"`);
    }

}
