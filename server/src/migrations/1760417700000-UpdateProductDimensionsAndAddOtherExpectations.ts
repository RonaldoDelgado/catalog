import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductDimensionsAndAddOtherExpectations1760417700000
  implements MigrationInterface
{
  name = 'UpdateProductDimensionsAndAddOtherExpectations1760417700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cambiar el tipo de la columna dimensions de jsonb a text
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "dimensions" TYPE text USING "dimensions"::text`,
    );

    // Agregar la nueva columna other_expectations
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "other_expectations" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la columna other_expectations
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "other_expectations"`,
    );

    // Revertir el tipo de dimensions de text a jsonb
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "dimensions" TYPE jsonb USING CASE 
        WHEN "dimensions" IS NULL THEN NULL 
        ELSE '{}'::jsonb 
      END`,
    );
  }
}
