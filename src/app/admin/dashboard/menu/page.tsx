import MenuPageClient from "./components/MenuPageClient";
import db from "@/lib/db";
import { Pencil, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MenuManagementPage() {
  const categoriesRes = await db.execute({ sql: 'SELECT * FROM Category WHERE restaurantId = ?', args: ['rest_1'] });
  const productsRes = await db.execute({ sql: 'SELECT p.*, c.name as categoryName FROM Product p JOIN Category c ON p.categoryId = c.id WHERE c.restaurantId = ? ORDER BY c.name, p.name', args: ['rest_1'] });

  const categories = categoriesRes.rows.map(row => ({
    id: String(row.id),
    name: String(row.name),
    restaurantId: String(row.restaurantId),
  }));
  
  const products = productsRes.rows.map(row => ({
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : "",
    price: Number(row.price),
    imageUrl: row.imageUrl ? String(row.imageUrl) : "",
    categoryId: String(row.categoryId),
    categoryName: String(row.categoryName),
  }));

  return (
    <div className="space-y-6">
      <MenuPageClient products={products} categories={categories} />
    </div>
  );
}
