"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Users, CalendarDays, TrendingUp } from "lucide-react";
import { getDashboardStats } from "../actions";

export default function DashboardClient({ initialStats, initialOrders }: { initialStats: any, initialOrders: any[] }) {
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchFilteredData = async (start: string, end: string) => {
    setLoading(true);
    const result = await getDashboardStats(start, end);
    if (result.success && result.stats) {
      setStats(result.stats);
      setRecentOrders(result.recentOrders);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    fetchFilteredData(startDate, endDate);
  };

  const setFilterPreset = (preset: 'today' | 'month' | 'all') => {
    const today = new Date();
    
    if (preset === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
      fetchFilteredData(todayStr, todayStr);
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
      fetchFilteredData(firstDay, todayStr);
    } else {
      setStartDate("");
      setEndDate("");
      fetchFilteredData("", "");
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs font-bold">Novo</span>;
      case 'PREPARING': return <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-bold">Preparo</span>;
      case 'READY': return <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Pronto</span>;
      case 'DELIVERED': return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-bold">Entregue</span>;
      default: return status;
    }
  }

  const averageTicket = stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Date Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Filtro de Período</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterPreset('today')} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">Hoje</button>
            <button onClick={() => setFilterPreset('month')} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">Este Mês</button>
            <button onClick={() => setFilterPreset('all')} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">Todo Período</button>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            />
            <span className="text-gray-400 font-bold">até</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            />
            <button 
              onClick={handleFilter}
              className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors shadow-sm"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-4 text-purple-600 font-bold animate-pulse">Atualizando dados...</div>}

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 truncate">Vendas Totais</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-black text-gray-900">R$ {stats.totalSales.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 truncate">Total de Pedidos</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-black text-gray-900">{stats.totalOrders}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 truncate">Ticket Médio</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-black text-gray-900">R$ {averageTicket}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 truncate">Clientes Únicos</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-black text-gray-900">{stats.uniqueClients}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className={`transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <h2 className="text-lg leading-6 font-bold text-gray-900 mt-8 mb-4">Pedidos no Período ({recentOrders.length})</h2>
        <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-100">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">Nenhum pedido encontrado para estas datas.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentOrders.map(order => (
                <li key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-gray-900">#{order.orderNumber || order.id.slice(4,8).toUpperCase()} - {order.customerName}</p>
                    <p className="text-sm text-gray-500 font-medium">{order.createdAt}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-black text-gray-900 text-lg">R$ {order.total.toFixed(2)}</span>
                    {formatStatus(order.status)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
