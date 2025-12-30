import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';
import { Profile } from './Profile';
import { Report } from './Report';

@Entity('access_logs')
export class AccessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'uuid', nullable: true })
  actorAccountId: string;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'uuid', nullable: true })
  profileId: string;

  @Column({ type: 'uuid', nullable: true })
  reportId: string;

  @Column({ type: 'text', nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.accessLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Account, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_account_id' })
  actorAccount: Account;

  @ManyToOne(() => Profile, (profile) => profile.accessLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Report, (report) => report.accessLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'report_id' })
  report: Report;
}

