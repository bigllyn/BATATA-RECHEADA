"use client";

import { useState } from "react";
import { Plus, Loader2, Sparkles, X, Pencil, Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";

export default function MenuPageClient({ products, categories }: { products: any[], categories: any[] }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/menu/import", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Cardápio importado com sucesso! " + data.itemsAdded + " itens adicionados.");
        window.location.reload();
      } else {
        alert("Erro ao importar: " + data.error);
      }
    } catch (error) {
      alert("Erro na requisição.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);

    try {
      const url = editingProduct ? `/api/menu/${editingProduct.id}` : "/api/menu";
      const method = editingProduct ? "PUT" : "POST";
      
      if (editingProduct && editingProduct.imageUrl && (!formData.get("image") || (formData.get("image") as File).size === 0)) {
        formData.append("imageUrl", editingProduct.imageUrl);
      }

      const res = await fetch(url, {
        method,
        body: formData
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        alert("Erro ao salvar produto.");
      }
    } catch (error) {
      alert("Erro na requisição.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gerenciar Cardápio</h2>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer shadow-sm shadow-purple-500/20">
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isUploading ? "Lendo imagem (IA)..." : "Criar via Foto (IA)"}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
          <button 
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm shadow-orange-500/20"
          >
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex space-x-4 border-b border-gray-200 pb-4 mb-4 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button key={cat.id} className="bg-purple-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Nenhum produto cadastrado ainda. Use o botão "Criar via Foto (IA)" acima!
                    </td>
                  </tr>
                )}
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                          {product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenEdit(product)} className="text-blue-600 hover:text-blue-900" title="Editar"><Pencil size={18} /></button>
                        <button onClick={async () => {
                          if (confirm("Tem certeza que deseja excluir?")) {
                            await deleteProduct(product.id);
                          }
                        }} className="text-red-600 hover:text-red-900" title="Excluir"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-gray-900/60 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-xl shadow-2xl transform transition-all sm:max-w-lg sm:w-full relative z-10 overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900" id="modal-title">{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition"><X size={20} /></button>
              </div>
              
              <form id="new-product-form" onSubmit={handleSaveProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto *</label>
                  <input type="text" name="name" defaultValue={editingProduct?.name || ""} required className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition" placeholder="Ex: Hambúrguer Clássico" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preço (R$) *</label>
                    <input type="number" step="0.01" name="price" defaultValue={editingProduct?.price || ""} required className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition" placeholder="25.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria *</label>
                    <input type="text" name="categoryName" defaultValue={editingProduct?.categoryName || ""} required placeholder="Ex: Burgers, Bebidas" className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct?.description || ""} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition" placeholder="Descreva os ingredientes..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Foto do Produto (Opcional)</label>
                  <div className="mt-1 flex items-center gap-4">
                    {editingProduct?.imageUrl && (
                      <img src={editingProduct.imageUrl} alt="Atual" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    )}
                    <input type="file" name="image" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Selecione uma imagem do seu computador para enviar.</p>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-gray-100">
              <button 
                type="submit" 
                form="new-product-form"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-orange-600 text-sm font-bold text-white hover:bg-orange-700 focus:outline-none transition disabled:opacity-70"
              >
                {isSubmitting ? "Salvando..." : "Salvar Produto"}
              </button>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
