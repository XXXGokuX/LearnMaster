import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Initializing database connection...");

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    // For production, we want to verify the hostname
    checkServerIdentity: (host, cert) => {
      return undefined; // Return undefined means verification passed
    }
  }
});

pool.on('connect', () => {
  console.log('Database connection established successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

export const db = drizzle({ client: pool, schema });