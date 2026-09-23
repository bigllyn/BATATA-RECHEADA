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

export async function saveProfile(name: string, description: string) {
  try {
    await db.execute({
      sql: 'UPDATE Restaurant SET name = ?, description = ? WHERE id = ?',
      args: [name, description, 'rest_1']
    });
    revalidatePath("/admin/dashboard/settings");
    revalidatePath("/[slug]");
    return { success: true };
  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, error: "Failed to save profile" };
  }
}

export async function getSettings() {
  try {
    const res = await db.execute({
      sql: 'SELECT pixKey, name, description FROM Restaurant WHERE id = ?',
      args: ['rest_1']
    });
    
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        pixKey: String(row.pixKey || ""),
        name: String(row.name || ""),
        description: String(row.description || "")
      };
    }
    return { pixKey: "", name: "", description: "" };
  } catch (error) {
    return { pixKey: "", name: "", description: "" };
  }
}
