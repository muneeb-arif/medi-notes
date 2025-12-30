import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

export enum ProcedureType {
  SURGERY = 'surgery',
  HOSPITALIZATION = 'hospitalization',
}

@Entity('procedures')
export class Procedure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({
    type: 'text',
    enum: ProcedureType,
  })
  type: ProcedureType;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isEmergencyVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.procedures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

