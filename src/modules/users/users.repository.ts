import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(user: { email: string; name: string; passwordHash: string }): Promise<User> {
    const query = `
      INSERT INTO users (email, name, password)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, password, created_at, updated_at;
    `;
    const result = await this.db.query<User>(query, [
      user.email.toLowerCase().trim(),
      user.name.trim(),
      user.passwordHash,
    ]);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, password, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1;
    `;
    const result = await this.db.query<User>(query, [email.toLowerCase().trim()]);
    return result.rows[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, name, password, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const result = await this.db.query<User>(query, [id]);
    return result.rows[0] ?? null;
  }
}
