import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Profile } from './Profile';
import { Report } from './Report';

@Entity('profile_reports')
@Unique(['profileId', 'reportId'])
export class ProfileReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @Column({ type: 'uuid' })
  reportId: string;

  @ManyToOne(() => Profile, (profile) => profile.profileReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Report, (report) => report.profileReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;
}

