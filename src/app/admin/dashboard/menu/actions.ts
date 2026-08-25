"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
  try {
    await db.execute({ sql: 'DELETE FROM Product WHERE id = ?', args: [id] });
    revalidatePath("/admin/dashboard/menu");
    revalidatePath("/[slug]");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product", error);
    return { success: false, error: "Failed to delete" };
  }
}
