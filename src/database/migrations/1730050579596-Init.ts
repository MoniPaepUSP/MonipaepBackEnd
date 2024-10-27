import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1730050579596 implements MigrationInterface {
    name = 'Init1730050579596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "password" character varying NOT NULL, "cpf" character varying NOT NULL, "email" character varying NOT NULL, "gender" character varying NOT NULL, "phone" character varying NOT NULL, "last_gps_location" character varying, "allow_sms" boolean NOT NULL, "work_address" character varying, "home_address" character varying NOT NULL, "neighborhood" character varying NOT NULL, "house_number" integer NOT NULL, "has_health_plan" boolean NOT NULL, "birthdate" date NOT NULL, "status" character varying NOT NULL, "active_account" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5947301223f5a908fd5e372b0fb" UNIQUE ("cpf"), CONSTRAINT "UQ_64e2031265399f5690b0beba6a5" UNIQUE ("email"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usm" ("name" character varying NOT NULL, "address" character varying NOT NULL, "neighborhood" character varying NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, CONSTRAINT "PK_2f650a91d1fa3acd6d8c1e571ae" PRIMARY KEY ("name"))`);
        await queryRunner.query(`CREATE TABLE "vaccines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL, "type" character varying NOT NULL, "patient_id" uuid NOT NULL, "usm_name" character varying NOT NULL, CONSTRAINT "PK_195bc56fe32c08445078655ec5a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "symptom" ("symptom" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_8f97720e071a619ce0d09e936f9" PRIMARY KEY ("symptom"))`);
        await queryRunner.query(`CREATE TABLE "disease" ("name" character varying NOT NULL, "infected_monitoring_days" integer NOT NULL, "suspected_monitoring_days" integer NOT NULL, CONSTRAINT "PK_8d91a7044538803aa90c0432ff9" PRIMARY KEY ("name"))`);
        await queryRunner.query(`CREATE TABLE "disease_occurrence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "disease_name" character varying NOT NULL, "diagnosis" character varying, "date_start" TIMESTAMP, "date_end" TIMESTAMP, "status" character varying NOT NULL, CONSTRAINT "PK_349e7a5d842845ccb673d044b83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "symptom_occurrence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "symptom_name" character varying NOT NULL, "disease_occurrence_id" uuid, "registered_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_93d94c53cafa526440a784fcf8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "system_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "cpf" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "department" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1af5788404f41f25ad18ff3fce2" UNIQUE ("cpf"), CONSTRAINT "UQ_741d321efeff6cfdf96dce44f85" UNIQUE ("email"), CONSTRAINT "PK_9949334be1756656fab9fac4a0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permissions" ("user_id" uuid NOT NULL, "authorized" boolean NOT NULL DEFAULT false, "local_adm" boolean NOT NULL DEFAULT false, "general_adm" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_03f05d2567b1421a6f294d69f45" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "patient_movement_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "disease_occurrence_id" uuid NOT NULL, "description" character varying NOT NULL, "date" date NOT NULL, CONSTRAINT "PK_cf233e8e6a959cac3b6c523da8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expires_in" integer NOT NULL, "patient_id" uuid, "system_user_id" uuid, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL, "when_remember" TIMESTAMP NOT NULL, "location" character varying NOT NULL, "type" character varying NOT NULL, "patient_id" uuid NOT NULL, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "faq" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" character varying NOT NULL, "answer" character varying NOT NULL, CONSTRAINT "UQ_1956813f611e3bf038f6b61a61f" UNIQUE ("question"), CONSTRAINT "PK_d6f5a52b1a96dd8d0591f9fbc47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "health_protocols" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_2e01103c2d4af9997ed33387b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assigned_healthprotocol" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "disease_name" character varying NOT NULL, "healthprotocol_id" uuid NOT NULL, CONSTRAINT "PK_691f53b322922d165f7fdbe0c2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "faq_suggestions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" character varying NOT NULL, CONSTRAINT "UQ_99977df3048ac88ddb0a099ed1c" UNIQUE ("question"), CONSTRAINT "PK_d30ff253498ed5952e2505e26db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "about" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "main" character varying NOT NULL, "secondary" character varying NOT NULL, CONSTRAINT "PK_e7b581a8a74d0a2ea3aa53226ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vaccines" ADD CONSTRAINT "FK_7694d4bd632b3516b3f73f05496" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "vaccines" ADD CONSTRAINT "FK_8e114a21b4c292e705a7fd55c1a" FOREIGN KEY ("usm_name") REFERENCES "usm"("name") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" ADD CONSTRAINT "FK_bc5da5499e120fc4728fde50670" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" ADD CONSTRAINT "FK_96d773f7d05744cbddb4f74705b" FOREIGN KEY ("disease_name") REFERENCES "disease"("name") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD CONSTRAINT "FK_55a9a709defb9eeb8b72ee336e6" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD CONSTRAINT "FK_bb73c156a007e4a037cbe146170" FOREIGN KEY ("symptom_name") REFERENCES "symptom"("symptom") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" ADD CONSTRAINT "FK_e7170b8270d8b4f2fef34c387de" FOREIGN KEY ("disease_occurrence_id") REFERENCES "disease_occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_03f05d2567b1421a6f294d69f45" FOREIGN KEY ("user_id") REFERENCES "system_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "patient_movement_history" ADD CONSTRAINT "FK_49b7aec1792284741d18d1b1496" FOREIGN KEY ("disease_occurrence_id") REFERENCES "disease_occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_03a62e95a4fd60f0114089d3d10" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_45d74df47c45d4ce7549abe634b" FOREIGN KEY ("system_user_id") REFERENCES "system_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "assigned_healthprotocol" ADD CONSTRAINT "FK_467764441a8843121760a323b16" FOREIGN KEY ("disease_name") REFERENCES "disease"("name") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "assigned_healthprotocol" ADD CONSTRAINT "FK_c981d8a67a81ed12a8ef5834166" FOREIGN KEY ("healthprotocol_id") REFERENCES "health_protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assigned_healthprotocol" DROP CONSTRAINT "FK_c981d8a67a81ed12a8ef5834166"`);
        await queryRunner.query(`ALTER TABLE "assigned_healthprotocol" DROP CONSTRAINT "FK_467764441a8843121760a323b16"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_45d74df47c45d4ce7549abe634b"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_03a62e95a4fd60f0114089d3d10"`);
        await queryRunner.query(`ALTER TABLE "patient_movement_history" DROP CONSTRAINT "FK_49b7aec1792284741d18d1b1496"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_03f05d2567b1421a6f294d69f45"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP CONSTRAINT "FK_e7170b8270d8b4f2fef34c387de"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP CONSTRAINT "FK_bb73c156a007e4a037cbe146170"`);
        await queryRunner.query(`ALTER TABLE "symptom_occurrence" DROP CONSTRAINT "FK_55a9a709defb9eeb8b72ee336e6"`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" DROP CONSTRAINT "FK_96d773f7d05744cbddb4f74705b"`);
        await queryRunner.query(`ALTER TABLE "disease_occurrence" DROP CONSTRAINT "FK_bc5da5499e120fc4728fde50670"`);
        await queryRunner.query(`ALTER TABLE "vaccines" DROP CONSTRAINT "FK_8e114a21b4c292e705a7fd55c1a"`);
        await queryRunner.query(`ALTER TABLE "vaccines" DROP CONSTRAINT "FK_7694d4bd632b3516b3f73f05496"`);
        await queryRunner.query(`DROP TABLE "about"`);
        await queryRunner.query(`DROP TABLE "faq_suggestions"`);
        await queryRunner.query(`DROP TABLE "assigned_healthprotocol"`);
        await queryRunner.query(`DROP TABLE "health_protocols"`);
        await queryRunner.query(`DROP TABLE "faq"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP TABLE "patient_movement_history"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "system_user"`);
        await queryRunner.query(`DROP TABLE "symptom_occurrence"`);
        await queryRunner.query(`DROP TABLE "disease_occurrence"`);
        await queryRunner.query(`DROP TABLE "disease"`);
        await queryRunner.query(`DROP TABLE "symptom"`);
        await queryRunner.query(`DROP TABLE "vaccines"`);
        await queryRunner.query(`DROP TABLE "usm"`);
        await queryRunner.query(`DROP TABLE "patients"`);
    }

}
