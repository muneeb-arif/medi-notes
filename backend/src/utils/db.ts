import { Pool, PoolClient } from 'pg';
import { config } from '../config/env';

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
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

