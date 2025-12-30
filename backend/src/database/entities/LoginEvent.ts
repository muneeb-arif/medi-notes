import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity('login_events')
export class LoginEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  accountId: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  eventType: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.loginEvents, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

