import { useMenuManager } from "@/hooks/useMenuManager";
import { type Category } from "@/types";
import { MenuItemCard } from "./MenuItemCard";

interface MenuSectionProps {
  category: Category;
  items: ReturnType<typeof useMenuManager>["items"];
  onAdd: (params: {
    id: string;
    name: string;
    description?: string;
    variant?: string;
    price: number;
  }) => void;
}

export function MenuSection({ category, items, onAdd }: MenuSectionProps) {
  const sectionItems = items.filter((item) => item.category === category);
  if (sectionItems.length === 0) return null;

  return (
    <section id={`cat-${category}`} className="scroll-mt-28">
      <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-primary">
        {category}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {sectionItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
