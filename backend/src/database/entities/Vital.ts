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
import { VitalProfileTag } from './VitalProfileTag';

@Entity('vitals')
export class Vital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'jsonb' })
  valueJson: Record<string, unknown>;

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @Column({ type: 'boolean', default: false })
  isEmergencyVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.vitals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @OneToMany(() => VitalProfileTag, (tag) => tag.vital)
  vitalProfileTags: VitalProfileTag[];
}

