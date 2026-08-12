import { NavLink } from "react-router";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  ArrowLeft,
  QrCode,
  ChefHat,
  Settings,
} from "lucide-react";

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/orders", icon: ClipboardList, label: "Pedidos" },
  { to: "/admin/menu", icon: UtensilsCrossed, label: "Menú" },
  { to: "/admin/tables", icon: QrCode, label: "Mesas & QR" },
  { to: "/admin/settings", icon: Settings, label: "Configuración" },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
          M
        </div>
        <span className="font-display text-lg font-bold text-primary">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}

        <div className="my-3 border-t" />

        <NavLink
          to="/kitchen"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-orange-100 text-orange-700"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <ChefHat className="h-4 w-4" />
          Pantalla Cocina
        </NavLink>
      </nav>

      <div className="border-t p-3">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Menú
        </NavLink>
      </div>
    </div>
  );
}
