import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Account } from './Account';
import { ProfileReport } from './ProfileReport';
import { AccessLog } from './AccessLog';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  reportType: string;

  @Column({ type: 'text' })
  fileKey: string;

  @Column({ type: 'text' })
  fileMimeType: string;

  @Column({ type: 'date', nullable: true })
  reportDate: Date;

  @Column({ type: 'boolean', default: false })
  isEmergencyVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @OneToMany(() => ProfileReport, (profileReport) => profileReport.report)
  profileReports: ProfileReport[];

  @OneToMany(() => AccessLog, (log) => log.report)
  accessLogs: AccessLog[];
}

