"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";

interface RoadmapItem {
  id: string;
  title: string;
  status: "Concluído" | "Em Progresso" | "Planejado";
  order_index: number;
}

export default function AdminRoadmapPage() {
  const { supabase, profile } = useSupabase();
  const router = useRouter();
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<RoadmapItem> | null>(
    null
  );

  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [profile, router]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("roadmap_items")
      .select("*")
      .order("order_index", { ascending: true });
    if (data) setItems(data as RoadmapItem[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchItems();
    }
  }, [profile, fetchItems]);

  const handleSave = async () => {
    if (!editingItem || editingItem.order_index === undefined) return;

    const newOrderIndex = editingItem.order_index;

    // Encontra um item que já tenha a nova ordem de exibição, excluindo o próprio item que está a ser editado.
    const conflictingItem = items.find(
      (item) => item.order_index === newOrderIndex && item.id !== editingItem.id
    );

    // Encontra o estado original do item que está a ser editado para obter a sua ordem de exibição anterior.
    const originalItem = editingItem.id
      ? items.find((item) => item.id === editingItem.id)
      : null;
    const oldOrderIndex = originalItem ? originalItem.order_index : null;

    // Se um item conflituoso for encontrado e estivermos a editar (não a criar) um item, faz a troca.
    if (conflictingItem && oldOrderIndex !== null) {
      const { error: swapError } = await supabase
        .from("roadmap_items")
        .update({ order_index: oldOrderIndex })
        .eq("id", conflictingItem.id);

      if (swapError) {
        alert(`Erro ao trocar a ordem: ${swapError.message}`);
        return;
      }
    }

    // Depois da troca (ou se não houver conflito), salva (upsert) o item que está a ser editado.
    const { error } = await supabase.from("roadmap_items").upsert({
      id: editingItem.id,
      title: editingItem.title,
      status: editingItem.status,
      order_index: newOrderIndex,
    });

    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
    } else {
      setEditingItem(null);
      fetchItems(); // Recarrega a lista para mostrar o estado atualizado
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja apagar este item do roadmap?")) {
      await supabase.from("roadmap_items").delete().eq("id", id);
      fetchItems();
    }
  };

  const handleAddNew = () => {
    const nextOrderIndex =
      items.length > 0 ? Math.max(...items.map((i) => i.order_index)) + 1 : 1;
    setEditingItem({
      id: undefined,
      title: "",
      status: "Planejado",
      order_index: nextOrderIndex,
    });
  };

  if (loading || !profile || profile.role !== "admin") {
    return <Spinner />;
  }

  // FORMULÁRIO DE EDIÇÃO / CRIAÇÃO
  if (editingItem) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          {editingItem.id ? "Editar Item" : "Novo Item do Roadmap"}
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={editingItem.title || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, title: e.target.value })
              }
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">
              Status
            </label>
            <select
              value={editingItem.status || "Planejado"}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  status: e.target.value as RoadmapItem["status"],
                })
              }
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            >
              <option value="Planejado">Planejado</option>
              <option value="Em Progresso">Em Progresso</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={editingItem.order_index || 0}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  order_index: parseInt(e.target.value) || 0,
                })
              }
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="py-2 px-6 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditingItem(null)}
              className="py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LISTA DE ITENS
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerir Roadmap</h1>
        <button
          onClick={handleAddNew}
          className="py-2 px-4 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700"
        >
          + Adicionar Item
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="border-b last:border-b-0 py-4 flex justify-between items-center"
            >
              <div>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <p className="text-sm text-gray-500">
                  Status: {item.status} / Ordem: {item.order_index}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-yellow-600 font-semibold hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
