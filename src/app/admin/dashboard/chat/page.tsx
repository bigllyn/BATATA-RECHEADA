"use client";

import { useState } from "react";
import { Send, Bot, User, Smartphone } from "lucide-react";

export default function ChatSimulatorPage() {
  const [messages, setMessages] = useState([
    { role: "model", text: "Olá! Como posso ajudar você hoje no Gourmet Bites?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare history for API (skip the first welcome message if we want, but it's fine)
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", text: "Erro na conexão." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Simulador de Atendimento IA (WhatsApp)</h2>
          <p className="text-sm text-gray-500">Teste como o seu robô atende os clientes e vende pelo cardápio.</p>
        </div>
      </div>

      <div className="flex-1 bg-gray-200 rounded-xl overflow-hidden flex border border-gray-300 shadow-inner max-w-4xl mx-auto w-full relative">
        {/* Mock Phone Container */}
        <div className="flex-1 flex flex-col bg-[#efeae2] relative">
          
          {/* WhatsApp Header */}
          <div className="bg-[#00a884] text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold">
              GB
            </div>
            <div>
              <h3 className="font-semibold">Gourmet Bites (IA)</h3>
              <p className="text-xs text-green-100">Online</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            <div className="text-center mb-4">
              <span className="bg-[#e1f3fb] text-gray-600 text-xs px-3 py-1 rounded-lg shadow-sm">
                As mensagens são protegidas com a criptografia ponta a ponta.
              </span>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm text-sm ${msg.role === 'user' ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                  <p className="text-gray-900 whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] text-gray-400 float-right mt-1 ml-3">Agora</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white max-w-[75%] rounded-lg px-3 py-2 shadow-sm text-sm">
                  <p className="text-gray-500 italic">Digitando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-[#f0f2f5] p-3 flex items-center gap-2">
            <form onSubmit={sendMessage} className="flex-1 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Digite uma mensagem (como se fosse o cliente)..." 
                className="flex-1 outline-none bg-transparent text-sm"
              />
              <button type="submit" disabled={isLoading} className="text-gray-500 hover:text-[#00a884] transition">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
