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
  const [viewMode, setViewMode] = useState<"home" | "menu">("home");

  useEffect(() => {
    fetch(`/api/menu/public?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => setStoreData(data))
      .catch(console.error);
  }, []);

  const addToCart = (product: any) => {
    if (storeData?.restaurant?.isOpen === 0) {
      alert("Nossa loja está fechada no momento. Volte mais tarde!");
      return;
    }
    setCart([...cart, product]);
  };

  const decreaseQuantity = (productId: string) => {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (cart.length === 0 && isCheckoutModalOpen) {
      setIsCheckoutModalOpen(false);
    }
  }, [cart.length, isCheckoutModalOpen]);

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    if (storeData?.restaurant?.isOpen === 0) {
      alert("Nossa loja está fechada no momento. Volte mais tarde!");
      return;
    }
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
        setViewMode("home");
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
    <div className="min-h-screen pb-24 font-sans relative w-full md:max-w-md mx-auto shadow-2xl overflow-hidden bg-gradient-to-b from-[#4A0000] to-[#110000] text-white">
      
      {/* Header - Only in menu mode */}
      {viewMode === "menu" && (
        <header className="px-5 pt-6 pb-2 bg-[#3A0000]/95 backdrop-blur-md sticky top-0 z-20 shadow-xl border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode("home")}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <h1 className="text-xl font-bold text-white">{restaurant.name}</h1>
            </div>
            <div className="flex items-center text-sm font-medium text-white/80">
              <MapPin size={16} className="mr-1" />
              Delivery
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-white/50" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-white/20 rounded-xl leading-5 bg-black/30 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 sm:text-sm transition-all shadow-inner"
              placeholder="Buscar pratos..."
            />
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="w-full flex flex-col items-center">
        {viewMode === "home" ? (
          <div className="w-full flex flex-col items-center px-4 pt-12 pb-8">
            {/* Logo */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 mb-6 flex items-center justify-center drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <img src="/logo.jpg" alt="Batata do Chef" className="w-full h-full object-contain rounded-full border-2 border-yellow-500/20" />
            </div>

            {restaurant.isOpen === 0 && (
              <div className="bg-red-600 text-white font-black px-6 py-2 rounded-full border-2 border-red-800 shadow-[0_0_15px_rgba(220,38,38,0.5)] mb-8 animate-pulse uppercase tracking-wider text-sm">
                Loja Fechada
              </div>
            )}
            
            {/* Grid of Categories */}
            <div className="grid grid-cols-2 gap-4 w-full relative z-10 max-w-[400px]">
              {["BATATA", "BEBIDAS", "ADICIONAIS", "SOBREMESA"].map((catName) => {
                // Inline SVGs for pure black icons
                let iconSvg = <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>;
                
                if (catName === "BATATA") {
                  // French Fries SVG
                  iconSvg = <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8l2-10H6l2 10z"/><path d="M9 11V3"/><path d="M12 11V4"/><path d="M15 11V3"/><path d="M7 11V5"/><path d="M17 11V5"/></svg>;
                } else if (catName === "BEBIDAS") {
                  // Bottle/Drink SVG
                  iconSvg = <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2H10z"/><path d="M10 6c0 1.5-1.5 3-1.5 5v11h7V11c0-2-1.5-3.5-1.5-5"/><path d="M14 10h5a1 1 0 0 1 1 1v11h-7"/></svg>;
                } else if (catName === "ADICIONAIS") {
                  // Bowl/Extras SVG
                  iconSvg = <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 0 0 16 0"/><path d="M2 12h20"/><path d="M12 2v4"/><path d="M8 4l2 3"/><path d="M16 4l-2 3"/></svg>;
                } else if (catName === "SOBREMESA") {
                  // Ice Cream/Dessert SVG
                  iconSvg = <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 11-4-8-4 8h8z"/><path d="M6 11a6 6 0 0 0 12 0H6z"/><path d="M12 21v-4"/><path d="M9 21h6"/></svg>;
                }

                return (
                  <button
                    key={catName}
                    onClick={() => {
                      setActiveCategory(catName);
                      setViewMode("menu");
                      window.scrollTo(0, 0);
                    }}
                    className="bg-gradient-to-b from-[#FFE370] to-[#E5AB00] text-black w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-[#FFE370] hover:scale-105 transition-transform active:scale-95"
                  >
                    <div className="text-black drop-shadow-sm scale-110">{iconSvg}</div>
                    <span className="font-extrabold text-[15px] sm:text-[17px] tracking-tight">{catName}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* Categories Horizontal */}
            <div className="px-5 mb-6 mt-4 overflow-x-auto no-scrollbar sticky top-[108px] bg-[#3A0000]/95 backdrop-blur-md z-10 py-2 border-b border-white/10 shadow-lg">
              <div className="flex gap-6">
                <button 
                  onClick={() => {
                    setActiveCategory("Todos");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex flex-col items-center gap-2 min-w-max transition-opacity ${activeCategory === "Todos" ? 'opacity-100 text-yellow-400' : 'opacity-60 text-white hover:opacity-100'}`}
                >
                  <span className="text-2xl">📋</span>
                  <span className={`text-sm ${activeCategory === "Todos" ? 'font-bold border-b-2 border-yellow-400 pb-1' : 'font-medium pb-1'}`}>Todos</span>
                </button>
                {categories.map((cat: any) => (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex flex-col items-center gap-2 min-w-max transition-opacity ${activeCategory === cat.name ? 'opacity-100 text-yellow-400' : 'opacity-60 text-white hover:opacity-100'}`}
                  >
                    <span className="text-2xl">{cat.icon || '🍽️'}</span>
                    <span className={`text-sm ${activeCategory === cat.name ? 'font-bold border-b-2 border-yellow-400 pb-1' : 'font-medium pb-1'}`}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-5 space-y-8">
              {products.length === 0 && <p className="text-white/50 text-sm">Nenhum produto cadastrado.</p>}

              {categories.map((cat: any) => {
                if (activeCategory !== "Todos" && activeCategory !== cat.name) return null;
                
                const catProducts = productsByCategory[cat.name];
                if (!catProducts || catProducts.length === 0) return null;

                return (
                  <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-40">
                    <h2 className="text-2xl font-black mb-4 text-yellow-400 tracking-tight">{cat.name}</h2>
                    <div className="space-y-4">
                      {catProducts.map((product: any) => (
                        <div key={product.id} className="flex gap-4 bg-black/40 p-3 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-sm">
                          <div className="w-28 h-28 flex-shrink-0 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center text-white/30 text-xs border border-white/5">
                            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : "Sem foto"}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white leading-tight pr-2">{product.name}</h3>
                                <span className="font-extrabold text-yellow-400 whitespace-nowrap">R$ {product.price.toFixed(2)}</span>
                              </div>
                              {product.description && <p className="text-xs text-white/60 mt-1 line-clamp-2">{product.description}</p>}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <button onClick={() => addToCart(product)} className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-xs font-bold px-4 py-1.5 rounded-full hover:brightness-110 transition-all shadow-md shadow-yellow-500/20">
                                Adicionar
                              </button>
                              <button onClick={() => addToCart(product)} className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-lg flex items-center justify-center hover:brightness-110 transition-all shadow-md shadow-yellow-500/20">
                                <Plus size={16} strokeWidth={3} />
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
          </div>
        )}
      </main>

      {/* Floating Checkout Button */}
      {cart.length > 0 && !isCheckoutModalOpen && (
        <div className="fixed bottom-20 left-0 right-0 px-5 flex justify-center max-w-md mx-auto animate-in slide-in-from-bottom-10 fade-in duration-300 z-30">
          <button 
            onClick={handleOpenCheckout}
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black flex items-center justify-between px-6 w-full max-w-[90%] py-3.5 rounded-full font-bold shadow-[0_10px_25px_rgba(234,179,8,0.3)] hover:scale-105 transition-transform active:scale-95"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} strokeWidth={2.5} />
              <span>Ver Carrinho ({cart.length})</span>
            </div>
            <span>R$ {total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t px-6 py-3 flex justify-between items-center w-full md:max-w-md mx-auto z-40 bg-[#2A0000] border-red-900/50">
        <button onClick={() => setViewMode("home")} className={`${viewMode === 'home' ? 'text-yellow-500' : 'text-white/50 hover:text-yellow-400'} transition-colors flex flex-col items-center gap-1`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        <button 
          onClick={() => {
            if (viewMode === 'home') setViewMode('menu');
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }} 
          className={`${viewMode === 'home' ? 'text-white/50 hover:text-yellow-500' : 'text-white/50 hover:text-yellow-400'} transition-colors flex flex-col items-center gap-1`}
        >
          <Search size={24} strokeWidth={2.5} />
        </button>
        <button onClick={handleOpenCheckout} className={`relative ${viewMode === 'home' ? 'text-white/50 hover:text-yellow-500' : 'text-white/50 hover:text-yellow-400'} transition-colors flex flex-col items-center gap-1`}>
          <ShoppingCart size={24} strokeWidth={2.5} />
          {cart.length > 0 && (
             <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-extrabold shadow-sm">
              {cart.length}
            </span>
          )}
        </button>
        <button onClick={() => alert("Área do Cliente: Em breve")} className={`${viewMode === 'home' ? 'text-white/50 hover:text-yellow-500' : 'text-white/50 hover:text-yellow-400'} transition-colors flex flex-col items-center gap-1`}>
          <User size={24} strokeWidth={2.5} />
        </button>
      </nav>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 w-full md:max-w-md mx-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsCheckoutModalOpen(false)}></div>
          
          <div className="bg-gradient-to-b from-[#3A0000] to-[#110000] border border-white/10 text-white rounded-t-3xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-all w-full relative z-10 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-3xl">
              <h3 className="text-xl font-bold text-yellow-400">Finalizar Pedido</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="bg-black/30 p-1.5 rounded-full text-white hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 no-scrollbar">
              <form id="checkout-form" onSubmit={submitOrder} className="space-y-6">
                
                {/* Resumo */}
                <div>
                  <h4 className="font-bold text-sm text-yellow-500/80 uppercase tracking-wider mb-2">Resumo do Pedido</h4>
                  
                  <div className="bg-black/40 rounded-xl border border-white/10 p-2 space-y-2 mb-2">
                    {Object.values(cart.reduce((acc, item) => {
                      acc[item.id] = acc[item.id] || { ...item, quantity: 0 };
                      acc[item.id].quantity += 1;
                      return acc;
                    }, {} as any)).map((item: any, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-lg border border-white/5 shadow-sm">
                        
                        {/* Ações de Quantidade */}
                        <div className="flex items-center gap-2 mr-3 bg-black/50 rounded-lg p-1">
                          <button type="button" onClick={() => decreaseQuantity(item.id)} className="w-7 h-7 bg-white/10 text-white rounded-md flex items-center justify-center font-bold hover:bg-red-500/80 transition-colors">-</button>
                          <span className="font-bold text-white min-w-[12px] text-center">{item.quantity}</span>
                          <button type="button" onClick={() => addToCart(item)} className="w-7 h-7 bg-yellow-500/20 text-yellow-400 rounded-md flex items-center justify-center font-bold hover:bg-yellow-500 hover:text-black transition-colors">+</button>
                        </div>
                        
                        {/* Nome do Produto */}
                        <div className="flex-1 font-bold text-white/90 leading-snug">
                          {item.name}
                        </div>
                        
                        {/* Preço e Lixeira */}
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400 font-extrabold whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          <button type="button" onClick={() => removeFromCart(item.id)} className="text-white/40 hover:text-red-500 transition-colors p-1">
                            <X size={18} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {cart.length === 0 && (
                      <div className="text-center py-4 text-white/50 text-sm">Seu carrinho está vazio.</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center p-3 font-bold bg-black/40 rounded-xl border border-white/10">
                    <span className="text-white/80">Total a pagar:</span>
                    <span className="text-yellow-400 text-2xl font-black">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dados de Entrega */}
                <div>
                  <h4 className="font-bold text-sm text-yellow-500/80 uppercase tracking-wider mb-2">Dados da Entrega</h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Seu Nome Completo" 
                      required 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-white/30"
                    />
                    <input 
                      type="tel" 
                      placeholder="Seu WhatsApp / Contato" 
                      required 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-white/30"
                    />
                    <textarea 
                      placeholder="Endereço Completo (Rua, Número, Bairro, Ref.)" 
                      required 
                      rows={3}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-white/30 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Pagamento */}
                <div>
                  <h4 className="font-bold text-sm text-yellow-500/80 uppercase tracking-wider mb-2">Forma de Pagamento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod("Pix")}
                      className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${paymentMethod === 'Pix' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                    >
                      Pix
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod("Dinheiro")}
                      className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${paymentMethod === 'Dinheiro' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                    >
                      Dinheiro/Cartão
                    </button>
                  </div>
                </div>

                {/* Info Pagamento */}
                {paymentMethod === "Pix" && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                    <p className="text-sm text-yellow-500/80 font-medium mb-1">Pague via Pix usando a chave:</p>
                    <p className="font-bold text-lg text-yellow-400">{restaurant.pixKey || "Chave não configurada"}</p>
                    <p className="text-xs text-yellow-500/60 mt-2">O comprovante poderá ser solicitado na entrega.</p>
                  </div>
                )}
                
                {paymentMethod === "Dinheiro" && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-sm text-white/70 font-medium">O motoboy levará a maquininha. Você também pode pagar em dinheiro trocado.</p>
                  </div>
                )}

              </form>
            </div>
            
            <div className="p-5 border-t border-white/10 bg-black/40 rounded-b-3xl">
              <button 
                type="submit" 
                form="checkout-form"
                disabled={isCheckingOut}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black py-4 rounded-xl font-black text-lg hover:brightness-110 transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-[0_4px_20px_rgba(234,179,8,0.3)]"
              >
                {isCheckingOut ? "Enviando Pedido..." : "CONFIRMAR PEDIDO"}
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
