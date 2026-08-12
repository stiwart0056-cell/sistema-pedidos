import { useState } from "react";
import { useMenuManager } from "@/hooks/useMenuManager";
import { useCategories } from "@/hooks/useCategories";
import type { MenuItem, MenuVariant } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Save, Trash2, Plus, Image, X, FolderPlus, FolderMinus } from "lucide-react";
import { resizeImageToBase64 } from "@/lib/image";

export function MenuEditorPage() {
  const { items, addItem, updateItem, deleteItem, addVariant, removeVariant } = useMenuManager();
  const { categories, addCategory, removeCategory } = useCategories();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    category: categories[0] || "",
    price: 0,
    description: "",
    name: "",
    image: "",
  });
  const [newVariants, setNewVariants] = useState<MenuVariant[]>([]);

  const filtered = items.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newItem.name) return;
    addItem({
      name: newItem.name,
      description: newItem.description || "",
      price: newItem.price || 0,
      category: newItem.category || categories[0] || "General",
      image: newItem.image || undefined,
      variants: newVariants.length > 0 ? newVariants : undefined,
    });
    setNewItem({
      category: categories[0] || "",
      price: 0,
      description: "",
      name: "",
      image: "",
    });
    setNewVariants([]);
    setIsAddOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName("");
    setShowNewCategory(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Editor de Menú
        </h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full font-display font-bold">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Nuevo Producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Mr Super Toast"
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Ingredientes..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoría</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem((p) => ({ ...p, category: e.target.value }))
                    }
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Precio (RD$)</Label>
                  <Input
                    type="number"
                    value={newItem.price || ""}
                    onChange={(e) =>
                      setNewItem((p) => ({
                        ...p,
                        price: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Imagen</Label>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted shrink-0">
                    {newItem.image ? (
                      <img src={newItem.image} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <Image className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const base64 = await resizeImageToBase64(file);
                          setNewItem((p) => ({ ...p, image: base64 }));
                        } catch {
                          alert("Error al procesar la imagen");
                        }
                      }}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={newItem.image || ""}
                        onChange={(e) => setNewItem((p) => ({ ...p, image: e.target.value }))}
                        placeholder="O pega una URL..."
                        className="h-8 text-xs"
                      />
                      {newItem.image && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setNewItem((p) => ({ ...p, image: "" }))}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Variantes (opcional)</Label>
                <div className="space-y-2">
                  {newVariants.map((v, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder="Nombre"
                        value={v.name}
                        onChange={(e) => {
                          const copy = [...newVariants];
                          copy[i].name = e.target.value;
                          setNewVariants(copy);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Precio"
                        value={v.price || ""}
                        onChange={(e) => {
                          const copy = [...newVariants];
                          copy[i].price = parseInt(e.target.value) || 0;
                          setNewVariants(copy);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setNewVariants((p) => p.filter((_, idx) => idx !== i))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNewVariants((p) => [...p, { name: "", price: 0 }])
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar variante
                  </Button>
                </div>
              </div>

              <Button className="w-full rounded-full" onClick={handleAddProduct}>
                Guardar Producto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Manager */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Categorías</h2>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 rounded-full"
            onClick={() => setShowNewCategory(!showNewCategory)}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            Nueva categoría
          </Button>
        </div>

        {showNewCategory && (
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Nombre de la categoría..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button size="sm" onClick={handleAddCategory}>
              Agregar
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1.5 text-sm"
            >
              {cat}
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar la categoría "${cat}"? Los productos en esta categoría seguirán existiendo.`)) {
                    removeCategory(cat);
                  }
                }}
                className="ml-1 text-muted-foreground hover:text-destructive"
                title="Eliminar categoría"
              >
                <FolderMinus className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl pl-10"
        />
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const catItems = filtered.filter((m) => m.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="mb-3 font-display text-xl font-bold text-primary">
                {cat}
              </h2>
              <div className="space-y-3">
                {catItems.map((item) => (
                  <EditableItemRow
                    key={item.id}
                    item={item}
                    categories={categories}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                    onAddVariant={addVariant}
                    onRemoveVariant={removeVariant}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditableItemRow({
  item,
  categories,
  onUpdate,
  onDelete,
  onAddVariant,
  onRemoveVariant,
}: {
  item: MenuItem;
  categories: string[];
  onUpdate: (id: string, changes: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
  onAddVariant: (id: string, v: MenuVariant) => void;
  onRemoveVariant: (id: string, name: string) => void;
}) {
  const [imgUrl, setImgUrl] = useState(item.image || "");
  const [price, setPrice] = useState(item.price ?? 0);
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.description);
  const [cat, setCat] = useState(item.category);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState(0);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Image preview & upload */}
        <div className="flex flex-col gap-2">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Image className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Input
              type="file"
              accept="image/*"
              className="h-8 text-[10px]"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const base64 = await resizeImageToBase64(file);
                  onUpdate(item.id, { image: base64 });
                  setImgUrl(base64);
                } catch {
                  alert("Error al procesar la imagen");
                }
              }}
            />
            <div className="flex gap-1">
              <Input
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="URL imagen"
                className="h-8 w-32 text-xs"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onUpdate(item.id, { image: imgUrl || undefined })}
              >
                <Save className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-display font-bold"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdate(item.id, { name })}
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdate(item.id, { description: desc })}
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <select
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdate(item.id, { category: cat })}
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          {item.price !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Precio:</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  RD$
                </span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  className="w-28 pl-10"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdate(item.id, { price })}
              >
                <Save className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Variants */}
          {item.variants && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {item.variants.map((v) => (
                <Badge
                  key={v.name}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {v.name}: RD$ {v.price.toLocaleString()}
                  <button
                    onClick={() => onRemoveVariant(item.id, v.name)}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  placeholder="Variante"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="h-7 w-24 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Precio"
                  value={variantPrice || ""}
                  onChange={(e) => setVariantPrice(parseInt(e.target.value) || 0)}
                  className="h-7 w-20 text-xs"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    if (variantName) {
                      onAddVariant(item.id, { name: variantName, price: variantPrice });
                      setVariantName("");
                      setVariantPrice(0);
                    }
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
