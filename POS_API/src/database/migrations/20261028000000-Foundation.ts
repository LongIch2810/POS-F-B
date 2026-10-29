import { MigrationInterface, QueryRunner } from 'typeorm';

export class Foundation20261028000000 implements MigrationInterface {
  name = 'Foundation20261028000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE stores (
        id uuid PRIMARY KEY,
        name varchar(150) NOT NULL,
        phone varchar(20),
        email varchar(150),
        address varchar(255),
        status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
        suspended_at timestamptz,
        suspended_reason varchar(255),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE branches (
        id uuid PRIMARY KEY,
        store_id uuid NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
        code varchar(10) NOT NULL,
        name varchar(150) NOT NULL,
        address varchar(255),
        phone varchar(20),
        initial_cash bigint NOT NULL DEFAULT 0 CHECK (initial_cash BETWEEN 0 AND 1000000000000),
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (store_id, code),
        UNIQUE (store_id, name)
      );
      CREATE TABLE roles (
        id uuid PRIMARY KEY,
        name varchar(50) NOT NULL UNIQUE,
        description varchar(255),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE permissions (
        id uuid PRIMARY KEY,
        code varchar(100) NOT NULL UNIQUE,
        description varchar(255),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE role_permissions (
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
        permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE RESTRICT,
        PRIMARY KEY (role_id, permission_id)
      );
      CREATE TABLE users (
        id uuid PRIMARY KEY,
        store_id uuid REFERENCES stores(id) ON DELETE RESTRICT,
        branch_id uuid REFERENCES branches(id) ON DELETE RESTRICT,
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
        full_name varchar(150) NOT NULL,
        username varchar(50) NOT NULL UNIQUE CHECK (username = lower(btrim(username))),
        password_hash varchar(255) NOT NULL,
        must_change_password boolean NOT NULL DEFAULT false,
        phone varchar(20),
        is_active boolean NOT NULL DEFAULT true,
        last_login_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_users_store_id ON users(store_id);
      CREATE INDEX idx_users_branch_id ON users(branch_id);
      CREATE TABLE refresh_tokens (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        session_id uuid NOT NULL,
        token_hash varchar(255) NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        replaced_at timestamptz,
        user_agent varchar(255),
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_refresh_tokens_user_session ON refresh_tokens(user_id, session_id);
      CREATE UNIQUE INDEX uq_refresh_tokens_current_session ON refresh_tokens(session_id) WHERE revoked_at IS NULL;
    `);
  }

  async down(): Promise<void> {
    throw new Error('Foundation migration cannot be reversed without deleting account data');
  }
}
