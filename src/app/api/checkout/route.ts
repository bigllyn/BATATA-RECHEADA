import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, customerName, phone, items, total, paymentMethod, address } = body;

    if (!restaurantId || !customerName || !phone || !items || items.length === 0) {
      return NextResponse.json({ error: "Dados incompletos para o pedido" }, { status: 400 });
    }

    const orderId = 'ord_' + randomUUID();
    let nextOrderNumber = 1000;

    const tx = await db.transaction("write");
    try {
      const maxOrderQuery = await tx.execute('SELECT MAX(orderNumber) as maxNum FROM CustomerOrder');
      const maxNum = maxOrderQuery.rows[0]?.maxNum as number | null;
      nextOrderNumber = maxNum ? maxNum + 1 : 1000;

      await tx.execute({
        sql: 'INSERT INTO CustomerOrder (id, restaurantId, customerName, phone, orderNumber, status, total, paymentMethod, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [orderId, restaurantId, customerName, phone, nextOrderNumber, 'PENDING', total, paymentMethod || 'Dinheiro', address || 'Retirada no Local']
      });

      for (const item of items) {
        await tx.execute({
          sql: 'INSERT INTO OrderItem (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)',
          args: ['item_' + randomUUID(), orderId, item.productId, item.quantity, item.price]
        });
      }
      
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }

    return NextResponse.json({ success: true, orderId, orderNumber: nextOrderNumber });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json({ error: "Falha ao processar pedido" }, { status: 500 });
  }
}
