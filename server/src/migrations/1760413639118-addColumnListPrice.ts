import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnListPrice1760413639118 implements MigrationInterface {
  name = 'AddColumnListPrice1760413639118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(100) NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "code" character varying(100) NOT NULL, "upc_code" character varying(100) NOT NULL, "description" text, "image_url" character varying(500), "dimensions" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7cfc24d6c24f0ec91294003d6b8" UNIQUE ("code"), CONSTRAINT "UQ_4f832a2106c00d15afab25471fa" UNIQUE ("upc_code"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "list_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_320e7815aa7fd001702dd3a8d99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "price_x_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "list_price_id" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fd0a37ad8a5675b655cb6bec444" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_08bf3a6bd05cf255c91c5b9e83" ON "price_x_list" ("product_id", "list_price_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "price_x_list" ADD CONSTRAINT "FK_1fd862acd92a5ce6e36d8964bd3" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_x_list" ADD CONSTRAINT "FK_4f5cfc39ff14e3ef78a8f8f7cde" FOREIGN KEY ("list_price_id") REFERENCES "list_prices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "price_x_list" DROP CONSTRAINT "FK_4f5cfc39ff14e3ef78a8f8f7cde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_x_list" DROP CONSTRAINT "FK_1fd862acd92a5ce6e36d8964bd3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_08bf3a6bd05cf255c91c5b9e83"`,
    );
    await queryRunner.query(`DROP TABLE "price_x_list"`);
    await queryRunner.query(`DROP TABLE "list_prices"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
