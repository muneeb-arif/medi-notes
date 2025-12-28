import { Pool, PoolClient } from 'pg';
import { config } from '../config/env';

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    // Use individual connection parameters if DATABASE_URL is not set or invalid
    const connectionConfig = config.databaseUrl && config.databaseUrl !== 'postgresql://localhost:5432/medinotes'
      ? { connectionString: config.databaseUrl }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'medinote',
        };

    pool = new Pool({
      ...connectionConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err: any) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
};

export const query = async <T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> => {
  const result = await getPool().query(text, params);
  return result.rows as T[];
};

export const queryOne = async <T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> => {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
};

export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

