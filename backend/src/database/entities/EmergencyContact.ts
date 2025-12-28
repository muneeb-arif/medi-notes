import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  relation: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'integer', default: 1 })
  priorityOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.emergencyContacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

