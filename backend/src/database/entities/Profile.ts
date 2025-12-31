import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Account } from './Account';
import { ProfileReport } from './ProfileReport';
import { VitalProfileTag } from './VitalProfileTag';
import { ProfileShare } from './ProfileShare';
import { AccessLog } from './AccessLog';
import { Appointment } from './Appointment';

@Entity('profiles')
@Unique(['accountId', 'name'])
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @OneToMany(() => ProfileReport, (profileReport) => profileReport.profile)
  profileReports: ProfileReport[];

  @OneToMany(() => VitalProfileTag, (tag) => tag.profile)
  vitalProfileTags: VitalProfileTag[];

  @OneToMany(() => ProfileShare, (share) => share.profile)
  profileShares: ProfileShare[];

  @OneToMany(() => AccessLog, (log) => log.profile)
  accessLogs: AccessLog[];

  @OneToMany(() => Appointment, (appointment) => appointment.profile)
  appointments: Appointment[];
}

