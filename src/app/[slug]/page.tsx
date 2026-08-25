"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Menu as MenuIcon, ShoppingCart, User, Plus, X } from "lucide-react";

export default function DigitalMenu({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  
  const [storeData, setStoreData] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  useEffect(() => {
    fetch("/api/menu/public")
      .then(res => res.json())
      .then(data => setStoreData(data))
      .catch(console.error);
  }, []);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !customerName || !phone) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setIsCheckingOut(true);
    
    const itemsMap = cart.reduce((acc, item) => {
      acc[item.id] = acc[item.id] || { productId: item.id, price: item.price, quantity: 0 };
      acc[item.id].quantity += 1;
      return acc;
    }, {});
    
    const orderData = {
      restaurantId: "rest_1",
      customerName,
      phone,
      address,
      paymentMethod,
      total,
      items: Object.values(itemsMap)
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      
      const responseData = await res.json();

      if (res.ok) {
        alert(`Pedido #${responseData.orderNumber} enviado com sucesso para a cozinha!`);
        setCart([]);
        setIsCheckoutModalOpen(false);
        setCustomerName("");
        setPhone("");
        setAddress("");
      } else {
        alert(`Erro ao enviar pedido: ${responseData.error}`);
      }
    } catch (e) {
      alert("Erro na conexão.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!storeData) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Carregando cardápio...</div>;
  }

  const { restaurant, categories, products } = storeData;

  // Group products by category
  const productsByCategory = categories.reduce((acc: any, cat: any) => {
    acc[cat.name] = products.filter((p: any) => p.categoryId === cat.id);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900 relative max-w-md mx-auto shadow-2xl overflow-hidden">
      
      {/* Header */}
      <header className="px-5 pt-6 pb-2 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6a1b9a] rounded-full flex items-center justify-center text-white font-bold">
              {restaurant.name.charAt(0)}
            </div>
            <h1 className="text-xl font-bold">{restaurant.name}</h1>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-600">
            <MapPin size={16} className="mr-1" />
            Delivery
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6a1b9a] sm:text-sm transition-all"
            placeholder="Buscar pratos..."
          />
        </div>
      </header>

      <main>
        {/* Categories */}
        <div className="px-5 mb-6 mt-4 overflow-x-auto no-scrollbar sticky top-[108px] bg-gray-50 z-10 py-2 border-b border-gray-200">
          <div className="flex gap-6">
            <button 
              onClick={() => {
                setActiveCategory("Todos");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-2 min-w-max transition-opacity ${activeCategory === "Todos" ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              <span className="text-2xl">🍔</span>
              <span className={`text-sm ${activeCategory === "Todos" ? 'font-bold border-b-2 border-black pb-1' : 'font-medium pb-1'}`}>Todos</span>
            </button>
            {categories.map((cat: any) => (
              <button 
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.name);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center gap-2 min-w-max transition-opacity ${activeCategory === cat.name ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
              >
                <span className="text-2xl">{cat.icon || '🍽️'}</span>
                <span className={`text-sm ${activeCategory === cat.name ? 'font-bold border-b-2 border-black pb-1' : 'font-medium pb-1'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-5 space-y-8">
          {products.length === 0 && <p className="text-gray-500 text-sm">Nenhum produto cadastrado.</p>}

          {categories.map((cat: any) => {
            if (activeCategory !== "Todos" && activeCategory !== cat.name) return null;
            
            const catProducts = productsByCategory[cat.name];
            if (!catProducts || catProducts.length === 0) return null;

            return (
              <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4">{cat.name}</h2>
                <div className="space-y-4">
                  {catProducts.map((product: any) => (
                    <div key={product.id} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center text-gray-400 text-xs">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : "Sem foto"}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900 leading-tight pr-2">{product.name}</h3>
                            <span className="font-bold text-gray-900 whitespace-nowrap">R$ {product.price.toFixed(2)}</span>
                          </div>
                          {product.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <button onClick={() => addToCart(product)} className="bg-green-700 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-green-800 transition-colors">
                            Adicionar
                          </button>
                          <button onClick={() => addToCart(product)} className="w-7 h-7 bg-green-700 text-white rounded-lg flex items-center justify-center hover:bg-green-800 transition-colors">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Checkout Button */}
      {cart.length > 0 && !isCheckoutModalOpen && (
        <div className="fixed bottom-20 left-0 right-0 px-5 flex justify-center max-w-md mx-auto animate-in slide-in-from-bottom-10 fade-in duration-300 z-30">
          <button 
            onClick={handleOpenCheckout}
            className="bg-green-700 text-white flex items-center justify-between px-6 w-full max-w-[90%] py-3.5 rounded-full font-bold shadow-xl shadow-green-900/20 hover:bg-green-800 transition-transform active:scale-95"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span>Ver Carrinho ({cart.length})</span>
            </div>
            <span>R$ {total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center max-w-md mx-auto z-20">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-green-700 flex flex-col items-center gap-1">
          <MenuIcon size={24} />
        </button>
        <button onClick={() => searchInputRef.current?.focus()} className="text-gray-400 hover:text-gray-900 transition-colors flex flex-col items-center gap-1">
          <Search size={24} />
        </button>
        <button onClick={handleOpenCheckout} className="relative text-gray-400 hover:text-gray-900 transition-colors flex flex-col items-center gap-1">
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
              {cart.length}
            </span>
          )}
        </button>
        <button onClick={() => alert("Área do Cliente: Em breve")} className="text-gray-400 hover:text-gray-900 transition-colors flex flex-col items-center gap-1">
          <User size={24} />
        </button>
      </nav>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 max-w-md mx-auto">
          <div className="fixed inset-0 bg-gray-900/60 transition-opacity" onClick={() => setIsCheckoutModalOpen(false)}></div>
          
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-all w-full relative z-10 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Finalizar Pedido</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form id="checkout-form" onSubmit={submitOrder} className="space-y-5">
                
                {/* Resumo */}
                <div>
                  <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Resumo</h4>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 font-bold">
                    <span>{cart.length} itens</span>
                    <span className="text-green-700 text-lg">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dados de Entrega */}
                <div>
                  <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Entrega</h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Seu Nome Completo" 
                      required 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6a1b9a]"
                    />
                    <input 
                      type="tel" 
                      placeholder="Seu WhatsApp / Contato" 
                      required 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6a1b9a]"
                    />
                    <textarea 
                      placeholder="Endereço de Entrega Completo (Rua, Número, Bairro, Referência)" 
                      required 
                      rows={3}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6a1b9a]"
                    ></textarea>
                  </div>
                </div>

                {/* Pagamento */}
                <div>
                  <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Pagamento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod("Pix")}
                      className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${paymentMethod === 'Pix' ? 'border-[#6a1b9a] bg-purple-50 text-[#6a1b9a]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      Pix
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod("Dinheiro")}
                      className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${paymentMethod === 'Dinheiro' ? 'border-[#6a1b9a] bg-purple-50 text-[#6a1b9a]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      Dinheiro/Cartão
                    </button>
                  </div>
                </div>

                {/* Info Pix */}
                {paymentMethod === "Pix" && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                    <p className="text-sm text-green-800 font-medium mb-1">Pague via Pix usando a chave:</p>
                    <p className="font-bold text-lg text-green-900">{restaurant.pixKey || "Chave não configurada na retaguarda"}</p>
                    <p className="text-xs text-green-700 mt-2">O comprovante poderá ser solicitado na entrega.</p>
                  </div>
                )}
                
                {paymentMethod === "Dinheiro" && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                    <p className="text-sm text-orange-800 font-medium">O motoboy levará a maquininha. Você também pode pagar em dinheiro trocado.</p>
                  </div>
                )}

              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-white">
              <button 
                type="submit" 
                form="checkout-form"
                disabled={isCheckingOut}
                className="w-full bg-[#6a1b9a] text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-800 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-purple-900/20"
              >
                {isCheckingOut ? "Enviando Pedido..." : "Confirmar Pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
