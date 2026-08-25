import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const restaurantRes = await db.execute({ sql: 'SELECT name, slug, pixKey FROM Restaurant WHERE id = ?', args: ['rest_1'] });
    const restaurant = restaurantRes.rows[0];

    const categoriesRes = await db.execute({
      sql: `
        SELECT id, name, icon 
        FROM Category 
        WHERE restaurantId = ? 
        ORDER BY 
          CASE name
            WHEN 'BATATA' THEN 1
            WHEN 'Bebidas' THEN 2
            WHEN 'ADICIONAIS' THEN 3
            ELSE 4
          END, name
      `,
      args: ['rest_1']
    });

    const productsRes = await db.execute({
      sql: 'SELECT p.*, c.name as categoryName FROM Product p JOIN Category c ON p.categoryId = c.id WHERE c.restaurantId = ? ORDER BY p.name',
      args: ['rest_1']
    });
    
    return NextResponse.json({
      restaurant: restaurant || { name: 'Creation', slug: 'creation', pixKey: '' },
      categories: categoriesRes.rows,
      products: productsRes.rows
    });
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
