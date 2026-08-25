import Link from "next/link";
import { Utensils } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center space-y-6 border-t-8 border-[#6a1b9a]">
        <div className="flex justify-center">
          <img src="/creation-logo.jpg" alt="Creation Logo" className="h-32 w-32 object-cover rounded-full shadow-lg border-4 border-white" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6a1b9a] to-[#2e7d32]">Creation</h1>
        <p className="text-gray-600 font-medium text-lg">
          Criamos • Conectamos • Resultados
        </p>
        
        <div className="space-y-4 pt-6">
          <Link 
            href="/admin/login" 
            className="block w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#6a1b9a] hover:bg-purple-800 transition-transform active:scale-95 shadow-md shadow-purple-900/20"
          >
            Acessar Painel da Agência/Admin
          </Link>
          <Link 
            href="/gourmet-bites" 
            className="block w-full py-3.5 px-4 rounded-xl font-bold text-[#6a1b9a] bg-purple-50 hover:bg-purple-100 transition-transform active:scale-95 border border-purple-200"
          >
            Ver Exemplo: Cardápio Digital
          </Link>
        </div>
      </div>
    </div>
  );
}
