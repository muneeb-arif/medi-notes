import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppointmentsTable1735584000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create appointments table
    await queryRunner.query(`
      CREATE TABLE appointments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        specialty TEXT,
        doctor_name TEXT,
        facility TEXT,
        location TEXT,
        start_at TIMESTAMP NOT NULL,
        end_at TIMESTAMP,
        status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) NOT NULL DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS appointments CASCADE`);
  }
}

