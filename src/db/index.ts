import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Graceful handling if DATABASE_URL is missing
  console.warn('DATABASE_URL is not set. Database features will be unavailable.');
}

const client = connectionString ? postgres(connectionString) : null;
export const db = client ? drizzle(client, { schema }) : null;
