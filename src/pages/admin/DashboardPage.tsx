import { useOrders } from "@/hooks/useOrders";
import { useMenuManager } from "@/hooks/useMenuManager";
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export function DashboardPage() {
  const { orders } = useOrders();
  const { items: menuItems } = useMenuManager();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalProducts = menuItems.length;

  // Top products
  const productSales: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((i) => {
      const key = i.variant ? `${i.name} (${i.variant})` : i.name;
      productSales[key] = (productSales[key] || 0) + i.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Sales by hour
  const hourSales = Array(24).fill(0);
  orders.forEach((o) => {
    const h = new Date(o.createdAt).getHours();
    hourSales[h] += o.total;
  });
  const hourlyData = HOURS.map((h, i) => ({ hour: h, sales: hourSales[i] }));

  // Sales by weekday
  const weekdaySales = Array(7).fill(0);
  orders.forEach((o) => {
    const d = new Date(o.createdAt).getDay();
    weekdaySales[d] += o.total;
  });
  const weekdayData = WEEK_DAYS.map((d, i) => ({ day: d, sales: weekdaySales[i] }));

  const stats = [
    { label: "Ingresos Totales", value: `RD$ ${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Total Pedidos", value: totalOrders, icon: ShoppingBag },
    { label: "Pendientes", value: pendingOrders, icon: Package },
    { label: "Productos", value: totalProducts, icon: TrendingUp },
  ];

  const recentOrders = orders.slice(0, 5);

  // Stock alerts
  const outOfStock = menuItems.filter((i) => i.isAvailable === false || (i.stock !== undefined && i.stock !== null && i.stock <= 0));
  const lowStock = menuItems.filter((i) => 
    i.isAvailable !== false && 
    i.stock !== undefined && 
    i.stock !== null && 
    i.stock > 0 && 
    i.stock <= 5
  );

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl border bg-white p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="space-y-3">
          {outOfStock.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="font-display font-bold">Productos Agotados ({outOfStock.length})</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {outOfStock.map((i) => (
                  <span key={i.id} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    {i.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="font-display font-bold">Stock Bajo ({lowStock.length})</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStock.map((i) => (
                  <span key={i.id} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {i.name} ({i.stock} restantes)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Productos Más Vendidos</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay ventas registradas
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} vendidos`, "Cantidad"]} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#1a1aff" : `hsl(233, 100%, ${60 + i * 4}%`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales by Weekday */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Ventas por Día de Semana</h2>
          </div>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay ventas registradas
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `RD$${v}`} />
                <Tooltip formatter={(v: number) => [`RD$ ${v.toLocaleString()}`, "Ventas"]} />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#1a1aff" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales by Hour */}
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Ventas por Horario</h2>
          </div>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay ventas registradas
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tickFormatter={(v) => `RD$${v}`} />
                <Tooltip formatter={(v: number) => [`RD$ ${v.toLocaleString()}`, "Ventas"]} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="#1a1aff" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Pedidos Recientes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pedidos registrados aún.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{o.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary">
                    RD$ {o.total.toLocaleString()}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      o.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : o.status === "preparing"
                        ? "bg-blue-100 text-blue-700"
                        : o.status === "ready"
                        ? "bg-green-100 text-green-700"
                        : o.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
