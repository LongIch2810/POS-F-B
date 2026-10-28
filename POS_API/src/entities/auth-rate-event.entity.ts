import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_rate_events')
export class AuthRateEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 30 })
  scope!: string;

  @Column({ type: 'char', length: 64 })
  key_hash!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  occurred_at!: Date;
}
