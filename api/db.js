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
  await ensureLegacyColumns(client);

  schemaReady = true;
}

async function ensureLegacyColumns(client) {
  const tableInfo = await client.execute(`PRAGMA table_info(subscribers)`);
  const existingColumns = new Set(tableInfo.rows.map((row) => String(row.name)));

  if (!existingColumns.has('ip')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN ip TEXT NOT NULL DEFAULT 'unknown'`);
  }
  if (!existingColumns.has('user_agent')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN user_agent TEXT`);
  }
  if (!existingColumns.has('created_at')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN created_at DATETIME`);
  }
  if (!existingColumns.has('updated_at')) {
    await client.execute(`ALTER TABLE subscribers ADD COLUMN updated_at DATETIME`);
  }
}

export async function upsertSubscriber({ email, source, ip, userAgent }) {
  const client = getClient();
  await ensureSchema();

  const statement = {
    sql: `
      INSERT INTO subscribers (email, source, ip, user_agent, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(email, source) DO UPDATE SET
        ip = excluded.ip,
        user_agent = excluded.user_agent,
        updated_at = CURRENT_TIMESTAMP
    `,
    args: [email, source, ip || 'unknown', userAgent || null],
  };

  try {
    await client.execute(statement);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('no column named ip') || message.includes('no column named user_agent')) {
      await ensureLegacyColumns(client);
      await client.execute(statement);
      return;
    }
    if (message.includes('UNIQUE constraint failed: subscribers.email')) {
      await client.execute({
        sql: `
          UPDATE subscribers
          SET source = ?, ip = ?, user_agent = ?, updated_at = CURRENT_TIMESTAMP
          WHERE email = ?
        `,
        args: [source, ip || 'unknown', userAgent || null, email],
      });
      return;
    }
    throw error;
  }
}
