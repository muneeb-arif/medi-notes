import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity('family_links')
export class FamilyLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'text' })
  relatedName: string;

  @Column({ type: 'text', nullable: true })
  relation: string;

  @Column({ type: 'text', nullable: true })
  bloodGroup: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.familyLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}

