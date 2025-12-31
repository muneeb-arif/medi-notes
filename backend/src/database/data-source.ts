import 'reflect-metadata';
import { DataSource, DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { Account } from './entities/Account';
import { AccountSettings } from './entities/AccountSettings';
import { EmergencyContact } from './entities/EmergencyContact';
import { Profile } from './entities/Profile';
import { Report } from './entities/Report';
import { ProfileReport } from './entities/ProfileReport';
import { Vital } from './entities/Vital';
import { VitalProfileTag } from './entities/VitalProfileTag';
import { Condition } from './entities/Condition';
import { Medication } from './entities/Medication';
import { Procedure } from './entities/Procedure';
import { Allergy } from './entities/Allergy';
import { FamilyLink } from './entities/FamilyLink';
import { OTPChallenge } from './entities/OTPChallenge';
import { AuthSession } from './entities/AuthSession';
import { LoginEvent } from './entities/LoginEvent';
import { ProfileShare } from './entities/ProfileShare';
import { AccessLog } from './entities/AccessLog';
import { EmergencyNominee } from './entities/EmergencyNominee';
import { EmergencySnapshot } from './entities/EmergencySnapshot';
import { Appointment } from './entities/Appointment';

class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(className: string, customName: string): string {
    if (customName) return customName;
    return className
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  columnName(propertyName: string, customName: string): string {
    if (customName) return customName;
    return propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medinote',
  entities: [
    Account,
    AccountSettings,
    EmergencyContact,
    Profile,
    Report,
    ProfileReport,
    Vital,
    VitalProfileTag,
    Condition,
    Medication,
    Procedure,
    Allergy,
    FamilyLink,
    OTPChallenge,
    AuthSession,
    LoginEvent,
    ProfileShare,
    AccessLog,
    EmergencyNominee,
    EmergencySnapshot,
    Appointment,
  ],
  migrations: ['src/database/migrations/**/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

