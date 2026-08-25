import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const categoryName = formData.get("categoryName") as string;
    const image = formData.get("image") as File;
    let imageUrl = formData.get("imageUrl") as string; // in case of edit or external URL

    if (!name || !price || !categoryName) {
      return NextResponse.json({ error: "Faltam campos obrigatórios" }, { status: 400 });
    }

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const tx = await db.transaction('write');
    try {
      let categoryRes = await tx.execute({
        sql: 'SELECT id FROM Category WHERE LOWER(name) = LOWER(?)',
        args: [categoryName]
      });
      
      let category = categoryRes.rows[0];
      
      if (!category) {
        const catId = 'cat_' + randomUUID();
        await tx.execute({
          sql: 'INSERT INTO Category (id, name, restaurantId) VALUES (?, ?, ?)',
          args: [catId, categoryName, 'rest_1']
        });
        category = { id: catId };
      }
      
      const prodId = 'prod_' + randomUUID();
      await tx.execute({
        sql: 'INSERT INTO Product (id, name, description, price, imageUrl, categoryId) VALUES (?, ?, ?, ?, ?, ?)',
        args: [prodId, name, description || null, parseFloat(price), imageUrl || null, category.id]
      });
      
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
