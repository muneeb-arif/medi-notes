import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Account } from './Account';

@Entity('emergency_snapshots')
@Unique(['accountId'])
export class EmergencySnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  accountId: string;

  @Column({ type: 'jsonb' })
  snapshotJson: Record<string, unknown>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;

  @OneToOne(() => Account, (account) => account.emergencySnapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

