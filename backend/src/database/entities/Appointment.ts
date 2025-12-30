import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './Profile';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  specialty: string | null;

  @Column({ type: 'text', nullable: true })
  doctorName: string | null;

  @Column({ type: 'text', nullable: true })
  facility: string | null;

  @Column({ type: 'text', nullable: true })
  location: string | null;

  @Column({ type: 'timestamp' })
  startAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endAt: Date | null;

  @Column({
    type: 'text',
    default: 'scheduled',
  })
  status: 'scheduled' | 'completed' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Profile, (profile) => profile.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}

