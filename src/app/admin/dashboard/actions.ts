"use server";

import db from "@/lib/db";

export async function getDashboardStats(startDateStr?: string, endDateStr?: string) {
  try {
    let dateFilter = "";
    let args: any[] = [];
    
    if (startDateStr && endDateStr) {
      // SQLite dates are stored as "YYYY-MM-DD HH:MM:SS"
      dateFilter = "WHERE createdAt >= ? AND createdAt <= ?";
      args = [`${startDateStr} 00:00:00`, `${endDateStr} 23:59:59`];
    }

    const statsRes = await db.execute({
      sql: `
        SELECT 
          COUNT(id) as totalOrders, 
          SUM(total) as totalSales,
          COUNT(DISTINCT phone) as uniqueClients
        FROM CustomerOrder
        ${dateFilter}
      `,
      args
    });
    
    const recentRes = await db.execute({
      sql: `
        SELECT id, orderNumber, customerName, total, status, createdAt
        FROM CustomerOrder 
        ${dateFilter}
        ORDER BY createdAt DESC 
        LIMIT 50
      `,
      args
    });

    return {
      success: true,
      stats: {
        totalOrders: Number(statsRes.rows[0]?.totalOrders) || 0,
        totalSales: Number(statsRes.rows[0]?.totalSales) || 0,
        uniqueClients: Number(statsRes.rows[0]?.uniqueClients) || 0,
      },
      recentOrders: recentRes.rows.map(row => ({
        id: String(row.id),
        orderNumber: Number(row.orderNumber) || 0,
        customerName: String(row.customerName),
        total: Number(row.total),
        status: String(row.status),
        createdAt: String(row.createdAt),
      }))
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    return { success: false, stats: null, recentOrders: [] };
  }
}
