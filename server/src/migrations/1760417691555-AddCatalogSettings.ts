import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCatalogSettings1760417691555 implements MigrationInterface {
  name = 'AddCatalogSettings1760417691555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "catalog_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(100) NOT NULL, "value" character varying(255) NOT NULL, "description" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_df5a53c202a2d7a5e68632199be" UNIQUE ("key"), CONSTRAINT "PK_cc0bd90d42c7787e3de96286065" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "catalog_settings"`);
  }
}
