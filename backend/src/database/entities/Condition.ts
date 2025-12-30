import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

export enum ConditionCategory {
  MAJOR = 'major',
  CHRONIC = 'chronic',
}

@Entity('conditions')
export class Condition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({
    type: 'text',
    enum: ConditionCategory,
  })
  category: ConditionCategory;

  @Column({ type: 'date', nullable: true })
  diagnosedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEmergencyVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.conditions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

