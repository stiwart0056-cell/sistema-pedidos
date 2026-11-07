import { useMemo, useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import {
  DollarSign,
  ShoppingBag,
  Receipt,
  Tag,
  TrendingUp,
  Download,
  Calendar,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types";

type Period = "today" | "yesterday" | "7d" | "month" | "all";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "yesterday", label: "Ayer" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "month", label: "Este mes" },
  { key: "all", label: "Todas" },
];

const TYPE_LABELS: Record<Order["type"], string> = {
  pickup: "Recoger en local",
  delivery: "Delivery",
  "dine-in": "En mesa",
};

const TYPE_COLORS: Record<Order["type"], string> = {
  pickup: "#1a1aff",
  delivery: "#f97316",
  "dine-in": "#22c55e",
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function inPeriod(o: Order, period: Period): boolean {
  const t = new Date(o.createdAt).getTime();
  const now = new Date();
  const todayStart = startOfDay(now);
  switch (period) {
    case "today":
      return t >= todayStart;
    case "yesterday":
      return t >= todayStart - 86400000 && t < todayStart;
    case "7d":
      return t >= todayStart - 6 * 86400000;
    case "month":
      return (
        new Date(o.createdAt).getMonth() === now.getMonth() &&
        new Date(o.createdAt).getFullYear() === now.getFullYear()
      );
    case "all":
      return true;
  }
}

const fmtMoney = (n: number) => `RD$ ${n.toLocaleString()}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function SalesPage() {
  const { orders } = useOrders();
  const [period, setPeriod] = useState<Period>("today");

  const sales = useMemo(
    () => orders.filter((o) => o.status === "delivered" && inPeriod(o, period)),
    [orders, period]
  );

  // KPIs
  const totalSales = sales.reduce((sum, o) => sum + o.finalTotal, 0);
  const orderCount = sales.length;
  const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;
  const totalDiscounts = sales.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalDeliveryFees = sales.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  // Breakdown by order type
  const byType = (["pickup", "delivery", "dine-in"] as const).map((t) => ({
    name: TYPE_LABELS[t],
    key: t,
    count: sales.filter((o) => o.type === t).length,
    amount: sales.filter((o) => o.type === t).reduce((s, o) => s + o.finalTotal, 0),
  }));

  // Sales by day — últimos 14 días (siempre, para tendencia)
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    orders
      .filter((o) => o.status === "delivered")
      .forEach((o) => {
        const key = o.createdAt.slice(0, 10);
        if (key in map) map[key] += o.finalTotal;
      });
    return Object.entries(map).map(([date, salesAmt]) => {
      const d = new Date(date + "T12:00:00");
      return {
        date: d.toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit" }),
        sales: salesAmt,
      };
    });
  }, [orders]);

  // Sales by hour of day (período seleccionado)
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0);
    sales.forEach((o) => {
      hours[new Date(o.createdAt).getHours()] += o.finalTotal;
    });
    return hours.map((salesAmt, h) => ({ hour: `${h}:00`, sales: salesAmt }));
  }, [sales]);

  const exportCSV = () => {
    const header = "Fecha,ID,Tipo,Cliente,Items,Subtotal,Descuento,Envio,Total\n";
    const rows = [...sales]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((o) =>
        [
          fmtDate(o.createdAt),
          o.id,
          TYPE_LABELS[o.type],
          o.customer?.name ? `"${o.customer.name}"` : "-",
          o.items.reduce((s, i) => s + i.quantity, 0),
          o.total,
          o.discount || 0,
          o.deliveryFee || 0,
          o.finalTotal,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob(["\ufeff" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Ventas del período", value: fmtMoney(totalSales), icon: DollarSign },
    { label: "Cantidad de ventas", value: orderCount, icon: ShoppingBag },
    { label: "Ticket promedio", value: fmtMoney(Math.round(avgTicket)), icon: Receipt },
    { label: "Descuentos aplicados", value: fmtMoney(totalDiscounts), icon: Tag },
  ];

  const sortedSales = [...sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-foreground">Ventas</h1>
        <Button
          variant="outline"
          className="gap-2 rounded-xl"
          onClick={exportCSV}
          disabled={sortedSales.length === 0}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtro de período */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              period === p.key
                ? "bg-primary text-primary-foreground"
                : "border bg-white text-muted-foreground hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
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

      {orderCount === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-lg font-bold text-foreground">
            No hay ventas entregadas en este período
          </p>
          <p className="text-sm text-muted-foreground">
            Las ventas aparecen cuando los pedidos se marcan como entregados.
          </p>
        </div>
      ) : (
        <>
          {/* Breakdown por tipo */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="mb-4 font-display text-xl font-bold">
                Ventas por tipo de pedido
              </h2>
              <div className="space-y-4">
                {byType.map((t) => {
                  const pct = totalSales > 0 ? Math.round((t.amount / totalSales) * 100) : 0;
                  return (
                    <div key={t.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {t.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {t.count} ventas
                          </span>
                        </span>
                        <span className="font-semibold">{fmtMoney(t.amount)}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: TYPE_COLORS[t.key],
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{pct}% del total</p>
                    </div>
                  );
                })}
              </div>
              {totalDeliveryFees > 0 && (
                <div className="mt-4 rounded-xl bg-muted/50 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Ingresos por envíos: </span>
                  <span className="font-semibold">{fmtMoney(totalDeliveryFees)}</span>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="mb-4 font-display text-xl font-bold">
                Distribución del período
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byType.filter((t) => t.count > 0)}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {byType
                      .filter((t) => t.count > 0)
                      .map((t) => (
                        <Cell key={t.key} fill={TYPE_COLORS[t.key]} />
                      ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmtMoney(v), "Ventas"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tendencia 14 días + horario del período */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Tendencia (14 días)</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={1} />
                  <YAxis tickFormatter={(v) => `RD$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [fmtMoney(v), "Ventas"]} />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="#1a1aff" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">
                  Ventas por horario ({PERIODS.find((p) => p.key === period)?.label})
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tickFormatter={(v) => `RD$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [fmtMoney(v), "Ventas"]} />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de ventas */}
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 font-display text-xl font-bold">
              Detalle de ventas ({sortedSales.length})
            </h2>
            <div className="max-h-[480px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Fecha</th>
                    <th className="py-2 pr-4 font-medium">ID</th>
                    <th className="py-2 pr-4 font-medium">Tipo</th>
                    <th className="py-2 pr-4 font-medium">Cliente</th>
                    <th className="py-2 pr-4 text-center font-medium">Items</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSales.map((o) => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 pr-4 text-muted-foreground">{fmtDate(o.createdAt)}</td>
                      <td className="py-2.5 pr-4 font-semibold">{o.id}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: `${TYPE_COLORS[o.type]}18`,
                            color: TYPE_COLORS[o.type],
                          }}
                        >
                          {TYPE_LABELS[o.type]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">{o.customer?.name || "-"}</td>
                      <td className="py-2.5 pr-4 text-center">
                        {o.items.reduce((s, i) => s + i.quantity, 0)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-primary">
                        {fmtMoney(o.finalTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
