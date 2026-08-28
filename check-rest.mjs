import { createClient } from "@libsql/client";
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(part => part.trim()))
);

const tursoDb = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

async function run() {
  const rest = await tursoDb.execute("SELECT * FROM Restaurant");
  console.log("Restaurant:", rest.rows);
}

run().catch(console.error);
