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
  const cats = await tursoDb.execute("SELECT * FROM Category");
  console.log("Categorias Atuais:", cats.rows);
  
  // Update EXODO to BEBIDAS
  const res = await tursoDb.execute("UPDATE Category SET name = 'Bebidas' WHERE UPPER(name) = 'EXODO' OR UPPER(name) = 'ÉXODO'");
  console.log("Update result:", res);
  
  const catsAfter = await tursoDb.execute("SELECT * FROM Category");
  console.log("Categorias Depois:", catsAfter.rows);
}

run().catch(console.error);
