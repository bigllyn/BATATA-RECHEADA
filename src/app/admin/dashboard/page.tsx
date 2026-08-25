import { DollarSign, ShoppingBag, Users } from "lucide-react";
import db from "@/lib/db";

// Next.js Server Component
export default async function DashboardPage() {
  
  const statsRes = await db.execute(`
    SELECT 
      COUNT(id) as totalOrders, 
      SUM(total) as totalSales,
      COUNT(DISTINCT phone) as uniqueClients
    FROM CustomerOrder
  `);
  const stats = statsRes.rows[0];

  const totalOrders = stats?.totalOrders || 0;
  const totalSales = stats?.totalSales || 0;
  const uniqueClients = stats?.uniqueClients || 0;

  const recentOrdersRes = await db.execute(`
    SELECT id, orderNumber, customerName, total, status, createdAt
    FROM CustomerOrder 
    ORDER BY createdAt DESC 
    LIMIT 5
  `);
  const recentOrders = recentOrdersRes.rows;

  const formatStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs font-bold">Novo</span>;
      case 'PREPARING': return <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-bold">Preparo</span>;
      case 'READY': return <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Pronto</span>;
      case 'DELIVERED': return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-bold">Entregue</span>;
      default: return status;
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vendas Totais</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">R$ {totalSales.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Pedidos</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalOrders}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Novos Clientes</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{uniqueClients}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">Pedidos Recentes</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum pedido recebido ainda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentOrders.map(order => (
              <li key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">#{order.orderNumber || order.id.slice(4,8)} - {order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.createdAt}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-gray-900">R$ {order.total.toFixed(2)}</span>
                  {formatStatus(order.status)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
