import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './Profile';
import { Account } from './Account';

@Entity('profile_shares')
export class ProfileShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @Column({ type: 'text', nullable: true })
  sharedWithPhone: string;

  @Column({ type: 'uuid', nullable: true })
  sharedWithAccountId: string;

  @Column({ type: 'jsonb' })
  accessScopeJson: Record<string, unknown>;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Profile, (profile) => profile.profileShares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Account, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'shared_with_account_id' })
  sharedWithAccount: Account;
}

