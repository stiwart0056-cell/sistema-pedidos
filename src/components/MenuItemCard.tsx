import { useState, useEffect, useRef } from "react";
import { Plus, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (params: {
    id: string;
    name: string;
    description?: string;
    variant?: string;
    price: number;
  }) => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    item.variants?.[0]?.name ?? null
  );
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPrice =
    item.variants && selectedVariant
      ? item.variants.find((v) => v.name === selectedVariant)?.price ??
        item.variants[0].price
      : item.price ?? 0;

  const isOutOfStock = item.isAvailable === false || (item.stock !== undefined && item.stock !== null && item.stock <= 0);
  const stockLabel = item.stock !== undefined && item.stock !== null
    ? item.stock <= 5 && item.stock > 0
      ? `¡Solo ${item.stock} left!`
      : item.stock > 0
      ? `${item.stock} disp.`
      : "Agotado"
    : null;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAdd({
      id: item.id,
      name: item.name,
      description: item.description,
      variant: selectedVariant || undefined,
      price: currentPrice,
    });
    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 1200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-shadow hover:shadow-md ${isOutOfStock ? 'opacity-70' : ''}`}>
      {item.image && (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`}
          />
          <Badge className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-md">
            RD$ {currentPrice.toLocaleString()}
          </Badge>
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
                AGOTADO
              </span>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold text-foreground">
                {item.name}
              </h3>
              {stockLabel && !isOutOfStock && item.stock !== undefined && item.stock !== null && item.stock <= 5 && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stockLabel}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
          {!item.image && (
            <Badge className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
              RD$ {currentPrice.toLocaleString()}
            </Badge>
          )}
        </div>

        {item.variants && (
          <div className="flex flex-wrap gap-2">
            {item.variants.map((v) => (
              <button
                key={v.name}
                onClick={() => !isOutOfStock && setSelectedVariant(v.name)}
                disabled={isOutOfStock}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedVariant === v.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        <Button
          size="sm"
          disabled={isOutOfStock}
          className={`w-full gap-2 rounded-xl font-display font-bold transition-all ${
            isOutOfStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : added
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          onClick={handleAdd}
        >
          {isOutOfStock ? (
            <>Agotado</>
          ) : added ? (
            <>
              <Check className="h-4 w-4" /> Agregado
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Agregar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
