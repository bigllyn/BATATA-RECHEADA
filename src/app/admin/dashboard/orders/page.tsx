"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Package, ChefHat } from "lucide-react";

type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
  items: string; // Comma separated items
  paymentMethod?: string;
  address?: string;
};

export default function KanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app we would use WebSockets / Server Sent Events for realtime
  // For the prototype we just poll every 3 seconds
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const changeStatus = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    
    await fetch("/api/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus })
    });
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return alert('Por favor, permita pop-ups para imprimir.');
    
    const html = `
      <html>
        <head>
          <title>Pedido #${order.orderNumber || order.id.slice(4,8)}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 14px; color: #000; }
            h2 { margin: 0 0 10px; font-size: 18px; text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>PEDIDO #${order.orderNumber || order.id.slice(4,8)}</h2>
          <div class="divider"></div>
          <div><span class="bold">Cliente:</span> ${order.customerName}</div>
          <div><span class="bold">Contato:</span> ${order.phone || 'Não informado'}</div>
          <div class="divider"></div>
          <div class="bold">ITENS:</div>
          <div>${order.items.split(', ').map(i => `<div>- ${i}</div>`).join('')}</div>
          <div class="divider"></div>
          <div><span class="bold">Total:</span> R$ ${order.total.toFixed(2)}</div>
          <div><span class="bold">Pagamento:</span> ${order.paymentMethod || 'Dinheiro'}</div>
          <div class="divider"></div>
          <div class="bold">ENDEREÇO DE ENTREGA:</div>
          <div>${order.address || 'Retirada no Local'}</div>
          <div class="divider"></div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px;">Criado pelo sistema Creation</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getStatusColumn = (status: string) => {
    return orders.filter(o => o.status === status);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando pedidos...</div>;

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gestão de Pedidos Ao Vivo</h2>
      </div>

      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        
        {/* PENDING */}
        <div className="flex-1 min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Clock size={18} className="text-orange-500" /> Novos Pedidos
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{getStatusColumn('PENDING').length}</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {getStatusColumn('PENDING').map(order => (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">#{order.orderNumber || order.id.slice(4,8).toUpperCase()}</span>
                  <span className="text-orange-600 font-semibold">R$ {order.total.toFixed(2)}</span>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                  <p className="text-xs font-medium text-gray-500">📞 {order.phone || 'Sem contato'}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded text-xs mb-2">
                  <p className="font-bold text-gray-700">📍 Entrega:</p>
                  <p className="text-gray-600 mb-1">{order.address}</p>
                  <p className="font-bold text-gray-700">💰 Pagamento: <span className="font-normal">{order.paymentMethod}</span></p>
                </div>
                <p className="text-xs text-gray-500 mb-4 font-medium p-2 bg-yellow-50 rounded border border-yellow-100">{order.items}</p>
                <button 
                  onClick={() => changeStatus(order.id, 'PREPARING')}
                  className="w-full bg-orange-100 text-orange-700 font-semibold py-2 rounded-md text-sm hover:bg-orange-200 transition mb-2"
                >
                  Aceitar e Preparar
                </button>
                <button 
                  onClick={() => printOrder(order)}
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-2 rounded-md text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  🖨️ Imprimir Pedido
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PREPARING */}
        <div className="flex-1 min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <ChefHat size={18} className="text-blue-500" /> Em Preparo
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{getStatusColumn('PREPARING').length}</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {getStatusColumn('PREPARING').map(order => (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">#{order.orderNumber || order.id.slice(4,8).toUpperCase()}</span>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                  <p className="text-xs font-medium text-gray-500">📞 {order.phone || 'Sem contato'}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded text-xs mb-2">
                  <p className="font-bold text-gray-700">📍 Entrega:</p>
                  <p className="text-gray-600 mb-1">{order.address}</p>
                  <p className="font-bold text-gray-700">💰 Pagamento: <span className="font-normal">{order.paymentMethod}</span></p>
                </div>
                <p className="text-xs text-gray-500 mb-4 font-medium p-2 bg-yellow-50 rounded border border-yellow-100">{order.items}</p>
                <button 
                  onClick={() => changeStatus(order.id, 'READY')}
                  className="w-full bg-blue-100 text-blue-700 font-semibold py-2 rounded-md text-sm hover:bg-blue-200 transition mb-2"
                >
                  Marcar como Pronto
                </button>
                <button 
                  onClick={() => printOrder(order)}
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-2 rounded-md text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  🖨️ Imprimir Pedido
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* READY */}
        <div className="flex-1 min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Package size={18} className="text-green-500" /> Pronto para Entrega
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{getStatusColumn('READY').length}</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {getStatusColumn('READY').map(order => (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">#{order.orderNumber || order.id.slice(4,8).toUpperCase()}</span>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                  <p className="text-xs font-medium text-gray-500">📞 {order.phone || 'Sem contato'}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded text-xs mb-4">
                  <p className="font-bold text-gray-700">📍 Entrega:</p>
                  <p className="text-gray-600 mb-2">{order.address}</p>
                  <p className="font-bold text-gray-700">💰 Pagamento: <span className="font-normal">{order.paymentMethod}</span></p>
                </div>
                <button 
                  onClick={() => changeStatus(order.id, 'DELIVERED')}
                  className="w-full bg-green-100 text-green-700 font-semibold py-2 rounded-md text-sm hover:bg-green-200 transition flex items-center justify-center gap-2 mb-2"
                >
                  <Check size={16} /> Entregue
                </button>
                <button 
                  onClick={() => printOrder(order)}
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-2 rounded-md text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  🖨️ Imprimir Pedido
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
