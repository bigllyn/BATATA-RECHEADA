import MenuPageClient from "./components/MenuPageClient";
import db from "@/lib/db";
import { Pencil, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MenuManagementPage() {
  const categoriesRes = await db.execute({ sql: 'SELECT * FROM Category WHERE restaurantId = ?', args: ['rest_1'] });
  const productsRes = await db.execute({ sql: 'SELECT p.*, c.name as categoryName FROM Product p JOIN Category c ON p.categoryId = c.id WHERE c.restaurantId = ? ORDER BY c.name, p.name', args: ['rest_1'] });

  const categories = categoriesRes.rows;
  const products = productsRes.rows;

  return (
    <div className="space-y-6">
      <MenuPageClient products={products} categories={categories} />
    </div>
  );
}
