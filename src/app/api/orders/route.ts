import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const ordersRes = await db.execute(`
      SELECT o.id, o.orderNumber, o.customerName, o.phone, o.total, o.status, o.paymentMethod, o.address,
        (SELECT GROUP_CONCAT(quantity || 'x ' || p.name, ', ') 
         FROM OrderItem oi 
         JOIN Product p ON oi.productId = p.id 
         WHERE oi.orderId = o.id) as items
      FROM CustomerOrder o
      WHERE o.restaurantId = 'rest_1' AND o.status != 'DELIVERED'
      ORDER BY o.createdAt ASC
    `);

    return NextResponse.json(ordersRes.rows);
  } catch (error) {
    console.error("Erro em orders API:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
