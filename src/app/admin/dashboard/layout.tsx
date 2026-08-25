import Link from "next/link";
import StoreStatusHeader from "./components/StoreStatusHeader";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200 gap-2">
          <img src="/creation-logo.jpg" alt="Creation Logo" className="h-10 w-10 object-cover rounded-full" />
          <span className="text-xl font-bold text-[#6a1b9a]">Creation</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/admin/dashboard" className="bg-orange-50 text-orange-600 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <LayoutDashboard className="mr-3 h-5 w-5 text-orange-500" />
            Visão Geral
          </Link>
          <Link href="/admin/dashboard/orders" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <ShoppingBag className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Pedidos Ao Vivo
          </Link>
          <Link href="/admin/dashboard/menu" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <UtensilsCrossed className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Cardápio
          </Link>
          <Link href="/admin/dashboard/settings" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Configurações
          </Link>
          <Link href="/admin/dashboard/chat" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <svg className="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.418-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
            </svg>
            Simulador de Chat
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link href="/admin/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <LogOut className="mr-2 h-5 w-5" />
            Sair
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <StoreStatusHeader />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
