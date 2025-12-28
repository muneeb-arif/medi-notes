import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Vital } from './Vital';
import { Profile } from './Profile';

@Entity('vital_profile_tags')
@Unique(['vitalId', 'profileId'])
export class VitalProfileTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vitalId: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Vital, (vital) => vital.vitalProfileTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vital_id' })
  vital: Vital;

  @ManyToOne(() => Profile, (profile) => profile.vitalProfileTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}

