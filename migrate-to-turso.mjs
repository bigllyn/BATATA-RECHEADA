import { createClient } from "@libsql/client";

const localDb = createClient({
  url: "file:anota-ai.db"
});

const tursoDb = createClient({
  url: "libsql://batata-recheada-benigno.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc2ODMwMjYsImlkIjoiMDFhMDNhMzAtNGIwMS03M2E1LThlNGMtM2FjODI4ZjAzOGYwIiwia2lkIjoiUG1ZV0EwLU00SzdRQUxhUnQxYUd6LTRxSUFxYXoyaUcxUGQzd3JxSWZZTSIsInJpZCI6Ijg2NDQ2MGYwLTE5ZjYtNGVjZi1hOTM0LTgzMjNlZDE4MDRhNSJ9.CSo3BOVYUf40qbKSIylmUezXeyJyulZz6K2yRgisMA3p0_nGnZMqfePFZoepWYRscKTgQA-tw6GIz0DmucjDAg"
});

async function migrate() {
  console.log("Starting migration to Turso...");
  
  // 1. Create tables in Turso (schema)
  await tursoDb.execute(`
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

  await tursoDb.execute(`
    CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      restaurantId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurantId) REFERENCES Restaurant (id) ON DELETE CASCADE
    )
  `);

  await tursoDb.execute(`
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

  await tursoDb.execute(`
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

  await tursoDb.execute(`
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

  console.log("Schema created on Turso.");

  // 2. Fetch data from local
  const restaurants = await localDb.execute("SELECT * FROM Restaurant");
  const categories = await localDb.execute("SELECT * FROM Category");
  const products = await localDb.execute("SELECT * FROM Product");
  const orders = await localDb.execute("SELECT * FROM CustomerOrder");
  const orderItems = await localDb.execute("SELECT * FROM OrderItem");

  console.log(`Found ${restaurants.rows.length} restaurants, ${categories.rows.length} categories, ${products.rows.length} products.`);

  // 3. Insert data to Turso
  const tx = await tursoDb.transaction("write");
  try {
    // Clear existing just in case
    await tx.execute("DELETE FROM OrderItem");
    await tx.execute("DELETE FROM CustomerOrder");
    await tx.execute("DELETE FROM Product");
    await tx.execute("DELETE FROM Category");
    await tx.execute("DELETE FROM Restaurant");

    const toArg = (v) => v === undefined ? null : v;

    for (const r of restaurants.rows) {
      await tx.execute({ sql: "INSERT INTO Restaurant (id, name, slug, description, logoUrl, bannerUrl, colorHex, createdAt, pixKey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [r.id, r.name, r.slug, r.description, r.logoUrl, r.bannerUrl, r.colorHex, r.createdAt, r.pixKey].map(toArg) });
    }
    
    for (const c of categories.rows) {
      await tx.execute({ sql: "INSERT INTO Category (id, name, icon, restaurantId, createdAt) VALUES (?, ?, ?, ?, ?)", args: [c.id, c.name, c.icon, c.restaurantId, c.createdAt].map(toArg) });
    }

    for (const p of products.rows) {
      await tx.execute({ sql: "INSERT INTO Product (id, categoryId, name, description, price, imageUrl, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", args: [p.id, p.categoryId, p.name, p.description, p.price, p.imageUrl, p.isActive, p.createdAt].map(toArg) });
    }
    
    for (const o of orders.rows) {
      await tx.execute({ sql: "INSERT INTO CustomerOrder (id, restaurantId, customerName, status, total, createdAt, paymentMethod, address, phone, orderNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [o.id, o.restaurantId, o.customerName, o.status, o.total, o.createdAt, o.paymentMethod, o.address, o.phone, o.orderNumber].map(toArg) });
    }

    for (const oi of orderItems.rows) {
      await tx.execute({ sql: "INSERT INTO OrderItem (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)", args: [oi.id, oi.orderId, oi.productId, oi.quantity, oi.price].map(toArg) });
    }

    await tx.commit();
    console.log("Data migrated successfully!");
  } catch (err) {
    await tx.rollback();
    console.error("Migration failed:", err);
  }
}

migrate();
