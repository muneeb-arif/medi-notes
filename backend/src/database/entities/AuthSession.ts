import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
}

@Entity('auth_sessions')
export class AuthSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text' })
  refreshTokenHash: string;

  @Column({ type: 'text', nullable: true })
  deviceId: string;

  @Column({
    type: 'text',
    nullable: true,
    enum: Platform,
  })
  platform: Platform;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUsedAt: Date;

  @ManyToOne(() => Account, (account) => account.authSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

