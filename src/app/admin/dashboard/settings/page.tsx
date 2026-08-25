"use client";

import { useState, useEffect } from "react";
import { Save, Store, CreditCard, Bell, Shield } from "lucide-react";
import { savePixKey, getSettings } from "./actions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [pixKey, setPixKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSettings().then(data => {
      setPixKey(String(data.pixKey || ""));
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    if (activeTab === "payments") {
      const result = await savePixKey(pixKey);
      if (result.success) {
        alert("Configurações salvas com sucesso!");
      } else {
        alert("Erro ao salvar.");
      }
    } else {
      alert("Demais abas ainda não conectadas ao banco de dados!");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-10 text-gray-500">Carregando configurações...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configurações</h2>
          <p className="text-sm text-gray-500">Gerencie as informações do seu restaurante e preferências do sistema.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`${activeTab === "profile" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition`}
            >
              <Store size={18} /> Perfil da Loja
            </button>
            <button 
              onClick={() => setActiveTab("payments")}
              className={`${activeTab === "payments" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition`}
            >
              <CreditCard size={18} /> Pagamentos
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`${activeTab === "notifications" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition`}
            >
              <Bell size={18} /> Notificações
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`${activeTab === "security" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition`}
            >
              <Shield size={18} /> Segurança
            </button>
          </nav>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 animate-in fade-in duration-300">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Nome do Restaurante</label>
                <input type="text" defaultValue="Gourmet Bites" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#6a1b9a] focus:border-[#6a1b9a] sm:text-sm" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Link do Cardápio (Slug)</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">creation-next.com/</span>
                  <input type="text" defaultValue="gourmet-bites" className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#6a1b9a] focus:border-[#6a1b9a] sm:text-sm" />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Descrição Curta</label>
                <textarea rows={3} defaultValue="Hambúrgueres artesanais feitos com paixão." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#6a1b9a] focus:border-[#6a1b9a] sm:text-sm" />
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Meios de Pagamento Aceitos</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-[#6a1b9a] focus:ring-[#6a1b9a] border-gray-300 rounded" />
                    <span className="text-gray-700 font-medium">Pix (Recebimento na hora)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-[#6a1b9a] focus:ring-[#6a1b9a] border-gray-300 rounded" />
                    <span className="text-gray-700 font-medium">Pagamento na Entrega (Maquininha/Dinheiro)</span>
                  </label>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração do Pix Automático</h3>
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700">Chave Pix (CPF, CNPJ, Email ou Celular)</label>
                  <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="Digite sua chave Pix" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#6a1b9a] focus:border-[#6a1b9a] sm:text-sm" />
                  <p className="mt-2 text-sm text-gray-500">O cliente verá esta chave no momento do checkout.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Avisos e Alertas</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-[#6a1b9a] focus:ring-[#6a1b9a] border-gray-300 rounded" />
                  <span className="text-gray-700">Tocar som na cozinha quando chegar novo pedido</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-[#6a1b9a] focus:ring-[#6a1b9a] border-gray-300 rounded" />
                  <span className="text-gray-700">Enviar aviso no WhatsApp do cliente quando pedido sair para entrega</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                  <input type="password" placeholder="••••••••" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#6a1b9a] focus:border-[#6a1b9a] sm:text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-[#6a1b9a] focus:border-[#6a1b9a] sm:text-sm" />
                </div>
              </div>
            </div>
          )}

        </div>
        
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <button type="button" onClick={handleSave} disabled={isSaving} className="bg-orange-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center gap-2">
            <Save size={16} />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
