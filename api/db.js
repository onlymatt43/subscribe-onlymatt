import { createClient } from '@libsql/client';

const dbUrl = process.env.TURSO_DATABASE_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN;

let cachedClient = null;
let schemaReady = false;

function getClient() {
  if (cachedClient) return cachedClient;
  if (!dbUrl || !dbToken) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }

  cachedClient = createClient({
    url: dbUrl,
    authToken: dbToken,
  });

  return cachedClient;
}

export async function ensureSchema() {
  if (schemaReady) return;
  const client = getClient();

  await client.execute(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      source TEXT NOT NULL,
      ip TEXT NOT NULL DEFAULT 'unknown',
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_source_idx
    ON subscribers(email, source)
  `);

  // Backward-compatible migration for already-existing tables.
  const tableInfo = await client.execute(`PRAGMA table_info(subscribers)`);
  const existingColumns = new Set(tableInfo.rows.map((row) => String(row.name)));

  if (!existingColumns.has('ip')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN ip TEXT NOT NULL DEFAULT 'unknown'`);
  }
  if (!existingColumns.has('user_agent')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN user_agent TEXT`);
  }
  if (!existingColumns.has('created_at')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
  }
  if (!existingColumns.has('updated_at')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
  }

  schemaReady = true;
}

export async function upsertSubscriber({ email, source, ip, userAgent }) {
  const client = getClient();
  await ensureSchema();

  await client.execute({
    sql: `
      INSERT INTO subscribers (email, source, ip, user_agent)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email, source) DO UPDATE SET
        ip = excluded.ip,
        user_agent = excluded.user_agent,
        updated_at = CURRENT_TIMESTAMP
    `,
    args: [email, source, ip || 'unknown', userAgent || null],
  });
}
