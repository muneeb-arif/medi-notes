import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { AccountSettings } from './AccountSettings';
import { EmergencyContact } from './EmergencyContact';
import { Profile } from './Profile';
import { Report } from './Report';
import { Vital } from './Vital';
import { Condition } from './Condition';
import { Medication } from './Medication';
import { Procedure } from './Procedure';
import { Allergy } from './Allergy';
import { FamilyLink } from './FamilyLink';
import { AuthSession } from './AuthSession';
import { LoginEvent } from './LoginEvent';
import { AccessLog } from './AccessLog';
import { EmergencyNominee } from './EmergencyNominee';
import { EmergencySnapshot } from './EmergencySnapshot';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  recoveryPhone: string;

  @Column({ type: 'text', nullable: true, unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  fullName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'text', nullable: true })
  bloodGroup: string;

  @Column({
    type: 'text',
    nullable: true,
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'integer', nullable: true })
  heightCm: number;

  @Column({ type: 'integer', nullable: true })
  weightKg: number;

  @Column({ type: 'text', nullable: true })
  maritalStatus: string;

  @Column({ type: 'integer', default: 0 })
  numberOfChildren: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => AccountSettings, (settings) => settings.account)
  settings: AccountSettings;

  @OneToMany(() => EmergencyContact, (contact) => contact.account)
  emergencyContacts: EmergencyContact[];

  @OneToMany(() => Profile, (profile) => profile.account)
  profiles: Profile[];

  @OneToMany(() => Report, (report) => report.account)
  reports: Report[];

  @OneToMany(() => Vital, (vital) => vital.account)
  vitals: Vital[];

  @OneToMany(() => Condition, (condition) => condition.account)
  conditions: Condition[];

  @OneToMany(() => Medication, (medication) => medication.account)
  medications: Medication[];

  @OneToMany(() => Procedure, (procedure) => procedure.account)
  procedures: Procedure[];

  @OneToMany(() => Allergy, (allergy) => allergy.account)
  allergies: Allergy[];

  @OneToMany(() => FamilyLink, (link) => link.account)
  familyLinks: FamilyLink[];

  @OneToMany(() => AuthSession, (session) => session.account)
  authSessions: AuthSession[];

  @OneToMany(() => LoginEvent, (event) => event.account)
  loginEvents: LoginEvent[];

  @OneToMany(() => AccessLog, (log) => log.account)
  accessLogs: AccessLog[];

  @OneToMany(() => EmergencyNominee, (nominee) => nominee.account)
  emergencyNominees: EmergencyNominee[];

  @OneToOne(() => EmergencySnapshot, (snapshot) => snapshot.account)
  emergencySnapshot: EmergencySnapshot;
}

