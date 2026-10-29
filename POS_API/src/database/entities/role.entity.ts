import { randomUUID } from 'node:crypto';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'uuid' })
  id: string = randomUUID();

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => User, (user) => user.role)
  users?: User[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  role_permissions?: RolePermission[];
}
