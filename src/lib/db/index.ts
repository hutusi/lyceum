import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import Database from "better-sqlite3";
import * as sqliteSchema from "./schema";
import * as pgSchema from "./schema.pg";

// Only use PostgreSQL if POSTGRES_URL is explicitly set
const usePostgres = !!process.env.POSTGRES_URL;

// Create database instance based on environment
function createDb() {
  if (usePostgres) {
    return drizzlePg(sql, { schema: pgSchema });
  }
  return drizzleSqlite(new Database("lyceum.db"), { schema: sqliteSchema });
}

// Use PostgreSQL when POSTGRES_URL is set, SQLite otherwise
// Type assertion to use SQLite types for development (most common case)
export const db = createDb() as ReturnType<typeof drizzleSqlite<typeof sqliteSchema>>;

// Re-export schema based on environment
export const schema = usePostgres ? pgSchema : sqliteSchema;

export type DB = typeof db;
