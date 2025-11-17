import 'dotenv/config';
import { Pool } from 'pg';

const host = process.env.DB_HOST ?? '127.0.0.1';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
const user = process.env.DB_USER ?? 'postgres';
const database = process.env.DB_DATABASE ?? 'postgres';
const password = process.env.DB_PASSWORD ?? '';

export const pool = new Pool({
  user,
  host,
  database,
  password,
  port,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 10000,
});

console.log(`Pool PostgreSQL: ${user}@${host}:${port}/${database}`);