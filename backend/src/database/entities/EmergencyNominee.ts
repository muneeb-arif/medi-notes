import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

export enum AccessMethod {
  OTP = 'otp',
  APP = 'app',
}

@Entity('emergency_nominees')
export class EmergencyNominee {
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

  @Column({
    type: 'text',
    enum: AccessMethod,
  })
  accessMethod: AccessMethod;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.emergencyNominees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

