"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

export default function StoreStatusHeader() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    setIsLoading(true);
    // In a real app, send API request to update DB
    await new Promise(r => setTimeout(r, 600)); 
    setIsOpen(!isOpen);
    setIsLoading(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard (Retaguarda)</h1>
      <div className="flex items-center gap-6">
        
        {/* Link to Customer View */}
        <a 
          href="/gourmet-bites" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100"
        >
          Ver Visão do Cliente <ExternalLink size={16} />
        </a>

        {/* Toggle Switch */}
        <div className="flex flex-col items-end">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isOpen}
              onChange={toggleStatus}
              disabled={isLoading}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            <span className={`ml-3 text-sm font-bold ${isOpen ? 'text-green-600' : 'text-gray-500'}`}>
              {isLoading ? 'Aguarde...' : isOpen ? 'Loja Aberta' : 'Loja Fechada'}
            </span>
          </label>
        </div>
      </div>
    </header>
  );
}
