import { createClient } from "@libsql/client";

// For local dev, use file:anota-ai.db. For prod (Netlify), use env vars.
const url = process.env.TURSO_DATABASE_URL || "file:anota-ai.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  authToken,
});

// Seed data async wrapper
async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Restaurant (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logoUrl TEXT,
      bannerUrl TEXT,
      colorHex TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      pixKey TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      restaurantId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurantId) REFERENCES Restaurant (id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      imageUrl TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES Category (id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS CustomerOrder (
      id TEXT PRIMARY KEY,
      restaurantId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      status TEXT NOT NULL,
      total REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      paymentMethod TEXT,
      address TEXT,
      phone TEXT,
      orderNumber INTEGER,
      FOREIGN KEY (restaurantId) REFERENCES Restaurant (id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS OrderItem (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES CustomerOrder (id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product (id)
    )
  `);

  // Insert default restaurant if not exists
  const rest = await db.execute("SELECT id FROM Restaurant WHERE id = 'rest_1'");
  if (rest.rows.length === 0) {
    await db.execute({
      sql: "INSERT INTO Restaurant (id, name, slug) VALUES (?, ?, ?)",
      args: ["rest_1", "Creation", "creation"]
    });
  }
}

// Fire and forget init
initDb().catch(console.error);

export default db;
