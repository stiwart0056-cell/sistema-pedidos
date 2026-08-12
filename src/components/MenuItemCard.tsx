import { useState, useEffect, useRef } from "react";
import { Plus, Check } from "lucide-react";
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

  const handleAdd = () => {
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-shadow hover:shadow-md">
      {item.image && (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-md">
            RD$ {currentPrice.toLocaleString()}
          </Badge>
        </div>
      )}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground">
              {item.name}
            </h3>
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
                onClick={() => setSelectedVariant(v.name)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedVariant === v.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        <Button
          size="sm"
          className={`w-full gap-2 rounded-xl font-display font-bold transition-all ${
            added
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          onClick={handleAdd}
        >
          {added ? (
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
