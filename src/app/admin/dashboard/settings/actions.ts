"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function savePixKey(pixKey: string) {
  try {
    await db.execute({
      sql: 'UPDATE Restaurant SET pixKey = ? WHERE id = ?',
      args: [pixKey, 'rest_1']
    });
    revalidatePath("/admin/dashboard/settings");
    revalidatePath("/[slug]");
    return { success: true };
  } catch (error) {
    console.error("Error saving pix key:", error);
    return { success: false, error: "Failed to save Pix Key" };
  }
}

export async function getSettings() {
  try {
    const res = await db.execute({
      sql: 'SELECT pixKey, name FROM Restaurant WHERE id = ?',
      args: ['rest_1']
    });
    return res.rows[0] || { pixKey: "", name: "" };
  } catch (error) {
    return { pixKey: "", name: "" };
  }
}
