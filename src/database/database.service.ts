import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const connectionString = this.configService.get<string>('DATABASE_URL');

    if (!connectionString || connectionString.includes('ep-cool-sample')) {
      this.logger.warn(
        '⚠️ DATABASE_URL is not configured with your real NeonDB credentials. Please update your .env file with your NeonDB connection string.',
      );
      return;
    }

    try {
      this.initPool(connectionString);
      await this.initSchema();
      this.logger.log('✅ Connected to PostgreSQL database successfully.');
    } catch (error) {
      this.logger.error(`❌ Failed to connect to PostgreSQL: ${(error as Error).message}`);
    }
  }

  private initPool(connectionString: string): void {
    const isSslRequired =
      connectionString.includes('sslmode=require') ||
      connectionString.includes('neon.tech');

    this.pool = new Pool({
      connectionString,
      ssl: isSslRequired ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  private async initSchema(): Promise<void> {
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.query(createUsersTableQuery);
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params: any[] = [],
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      const connectionString = this.configService.get<string>('DATABASE_URL');
      if (connectionString && !connectionString.includes('ep-cool-sample')) {
        this.initPool(connectionString);
      }
    }

    if (!this.pool) {
      throw new Error(
        'Database connection is not initialized. Please verify your DATABASE_URL in .env',
      );
    }

    return this.pool.query<T>(text, params);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('PostgreSQL connection pool closed.');
    }
  }
}
