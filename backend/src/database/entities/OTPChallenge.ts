import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum OTPChannel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
}

export enum OTPPurpose {
  LOGIN = 'login',
  RECOVERY = 'recovery',
}

@Entity('otp_challenges')
export class OTPChallenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  otpHash: string;

  @Column({
    type: 'text',
    enum: OTPChannel,
  })
  channel: OTPChannel;

  @Column({
    type: 'text',
    enum: OTPPurpose,
  })
  purpose: OTPPurpose;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'integer', default: 0 })
  attemptsUsed: number;

  @Column({ type: 'integer', default: 5 })
  maxAttempts: number;

  @Column({ type: 'text', nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}

