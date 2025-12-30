import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity('account_settings')
export class AccountSettings {
  @PrimaryColumn({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text', default: 'en' })
  language: string;

  @Column({ type: 'boolean', default: true })
  emergencyEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Account, (account) => account.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

