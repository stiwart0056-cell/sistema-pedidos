import { categories, type Category } from "@/types";

interface CategoryNavProps {
  activeCategory: Category | null;
  onSelect: (category: Category) => void;
}

export function CategoryNav({ activeCategory, onSelect }: CategoryNavProps) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-3xl">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`shrink-0 rounded-full px-4 py-2 font-display text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-white text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
