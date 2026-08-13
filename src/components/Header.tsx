import { useRestaurantConfig } from "@/hooks/useRestaurantConfig";

export function Header() {
  const { config } = useRestaurantConfig();

  return (
    <header className="relative overflow-hidden bg-background pb-8 pt-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
          <span>Since 2024</span>
          <span className="inline-block h-1 w-1 rounded-full bg-primary" />
          <span>{config.slogan || "Sandwiches & Toasts"}</span>
        </div>

        {config.logo ? (
          <img
            src={config.logo}
            alt={config.name}
            className="h-auto w-48 object-contain drop-shadow-xl sm:w-64"
          />
        ) : (
          <h1 className="font-display text-6xl font-black tracking-tight text-primary sm:text-7xl">
            {config.name.split(" ")[0] || "MR"}.
            <br />
            {config.name.split(" ").slice(1).join(" ") || "TOASTED"}
          </h1>
        )}

        <div className="mt-2 inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-primary-foreground">
          Menú
        </div>

        {!config.logo && (
          <img
            src="/mascot.png"
            alt={`${config.name} mascot`}
            className="mt-6 h-auto w-64 object-contain drop-shadow-xl sm:w-80"
          />
        )}
      </div>
    </header>
  );
}
