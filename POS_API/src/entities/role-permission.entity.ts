import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ type: 'uuid' })
  role_id!: string;

  @PrimaryColumn({ type: 'uuid' })
  permission_id!: string;

  @ManyToOne(() => Role, (role) => role.role_permissions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @ManyToOne(() => Permission, (perm) => perm.role_permissions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'permission_id' })
  permission?: Permission;
}
