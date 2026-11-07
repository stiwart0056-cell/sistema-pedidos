import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { useCashClosings } from "@/hooks/useCashClosings";
import {
  Wallet,
  Banknote,
  CreditCard,
  Smartphone,
  Calculator,
  Save,
  History,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentMethod } from "@/types";

const fmtMoney = (n: number) => `RD$ ${Math.round(n).toLocaleString()}`;

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function CashClosePage() {
  const { orders } = useOrders();
  const { closings, addClosing } = useCashClosings();

  const [openingCash, setOpeningCash] = useState("");
  const [countedCash, setCountedCash] = useState("");
  const [notes, setNotes] = useState("");

  const today = todayStr();

  // Ventas de HOY (solo entregadas)
  const todaySales = useMemo(
    () =>
      orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return o.status === "delivered" && t >= startOfDay(new Date());
      }),
    [orders]
  );

  // Los pedidos antiguos sin payment_method se asumen en efectivo
  const methodOf = (o: { paymentMethod?: PaymentMethod }): PaymentMethod =>
    o.paymentMethod ?? "cash";

  const byMethod = useMemo(() => {
    const result: Record<PaymentMethod, number> = { cash: 0, card: 0, transfer: 0 };
    todaySales.forEach((o) => {
      result[methodOf(o)] += o.finalTotal;
    });
    return result;
  }, [todaySales]);

  const cashSales = byMethod.cash;
  const cardSales = byMethod.card;
  const transferSales = byMethod.transfer;
  const totalSales = cashSales + cardSales + transferSales;
  const ordersCount = todaySales.length;

  // Arqueo
  const opening = parseFloat(openingCash) || 0;
  const counted = parseFloat(countedCash) || 0;
  const expectedCash = opening + cashSales;
  const difference = counted - expectedCash;
  const hasCounted = countedCash.trim() !== "";

  // Cierre de hoy ya existe?
  const todayClosing = closings.find((c) => c.closingDate === today);
  const alreadyClosed = !!todayClosing;

  const canClose = ordersCount >= 0 && hasCounted;

  const handleClose = async () => {
    if (!hasCounted) {
      toast.error("Ingresa el efectivo contado físicamente");
      return;
    }
    await addClosing({
      closingDate: today,
      openingCash: opening,
      cashSales,
      cardSales,
      transferSales,
      totalSales,
      ordersCount,
      expectedCash,
      countedCash: counted,
      difference,
      notes: notes.trim() || undefined,
    });
    toast.success(
      alreadyClosed
        ? "Cierre de caja actualizado correctamente"
        : "¡Caja cerrada correctamente!"
    );
  };

  const exportClosing = () => {
    const lines = [
      `CIERRE DE CAJA - ${today}`,
      ``,
      `Ventas del día: ${fmtMoney(totalSales)} (${ordersCount} pedidos)`,
      `  Efectivo:      ${fmtMoney(cashSales)}`,
      `  Tarjeta:       ${fmtMoney(cardSales)}`,
      `  Transferencia: ${fmtMoney(transferSales)}`,
      ``,
      `Efectivo de apertura: ${fmtMoney(opening)}`,
      `Esperado en caja:     ${fmtMoney(expectedCash)}`,
      `Contado físicamente:  ${fmtMoney(counted)}`,
      `Diferencia:           ${fmtMoney(difference)}`,
      notes.trim() ? `Notas: ${notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob(["\ufeff" + lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cierre-caja-${today}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const diffColor =
    !hasCounted || Math.round(difference) === 0
      ? "text-green-600"
      : difference > 0
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Cierre de Caja
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("es-DO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Resumen del día */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ventas de hoy</p>
            <p className="font-display text-2xl font-bold">{fmtMoney(totalSales)}</p>
            <p className="text-xs text-muted-foreground">{ordersCount} pedidos entregados</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{METHOD_LABELS.cash}</p>
            <p className="font-display text-2xl font-bold">{fmtMoney(cashSales)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{METHOD_LABELS.card}</p>
            <p className="font-display text-2xl font-bold">{fmtMoney(cardSales)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{METHOD_LABELS.transfer}</p>
            <p className="font-display text-2xl font-bold">{fmtMoney(transferSales)}</p>
          </div>
        </div>
      </div>

      {/* Advertencia: cierre ya existe */}
      {alreadyClosed && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-700">
              Ya existe un cierre registrado hoy
            </p>
            <p className="text-amber-600">
              Contado: {fmtMoney(todayClosing!.countedCash)} · Diferencia:{" "}
              {fmtMoney(todayClosing!.difference)}. Si cierras de nuevo se creará
              un registro adicional — usa el historial para comparar.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario de arqueo */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Arqueo de efectivo</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opening">Efectivo de apertura (base de caja)</Label>
                <Input
                  id="opening"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Monto con el que abriste la caja hoy
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="counted">Efectivo contado físicamente *</Label>
                <Input
                  id="counted"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas del cierre (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: faltan RD$200 por cambio prestado, gasto de compra, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="flex-1 gap-2 rounded-xl py-6 font-display text-lg font-bold"
              onClick={handleClose}
              disabled={!canClose}
            >
              <Save className="h-5 w-5" />
              {alreadyClosed ? "Registrar nuevo cierre" : "Cerrar caja"}
            </Button>
            <Button variant="outline" className="rounded-xl px-6" onClick={exportClosing}>
              Imprimir / Descargar
            </Button>
          </div>
        </div>

        {/* Cuadre */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Cuadre del día</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <span className="text-sm">Apertura + ventas en efectivo</span>
              <span className="font-semibold">{fmtMoney(expectedCash)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <span className="text-sm">Esperado en caja</span>
              <span className="font-display text-lg font-bold">{fmtMoney(expectedCash)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <span className="text-sm">Contado físicamente</span>
              <span className="font-display text-lg font-bold">
                {hasCounted ? fmtMoney(counted) : "—"}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl px-4 py-4 ${
                !hasCounted
                  ? "bg-muted/50"
                  : Math.round(difference) === 0
                  ? "bg-green-50 border border-green-200"
                  : difference > 0
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                {hasCounted && Math.round(difference) === 0 && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {hasCounted && Math.round(difference) !== 0 && (
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      difference > 0 ? "text-amber-600" : "text-red-600"
                    }`}
                  />
                )}
                Diferencia
              </span>
              <span className={`font-display text-2xl font-bold ${diffColor}`}>
                {hasCounted ? fmtMoney(difference) : "—"}
              </span>
            </div>

            {hasCounted && Math.round(difference) !== 0 && (
              <p className="text-xs text-muted-foreground">
                {difference > 0
                  ? "Sobran efectivo en caja. Revisa si hubo ingresos no registrados o cambio incorrecto."
                  : "Falta efectivo en caja. Revisa si hubo gastos, cambio mal dado o un pago en efectivo no cobrado."}
              </p>
            )}
            {hasCounted && Math.round(difference) === 0 && (
              <p className="text-xs text-green-600">
                ¡Cuadre perfecto! La caja coincide exactamente con lo esperado.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
            Recuerda: solo cuentan los pedidos marcados como <strong>Entregados</strong>.
            Las tarjetas y transferencias no pasan por la caja física.
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Historial de cierres</h2>
        </div>

        {closings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aún no hay cierres registrados.
          </p>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Fecha</th>
                  <th className="py-2 pr-4 text-right font-medium">Ventas</th>
                  <th className="py-2 pr-4 text-center font-medium">Pedidos</th>
                  <th className="py-2 pr-4 text-right font-medium">Esperado</th>
                  <th className="py-2 pr-4 text-right font-medium">Contado</th>
                  <th className="py-2 pr-4 text-right font-medium">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {closings.slice(0, 30).map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b last:border-0 hover:bg-muted/40 ${
                      c.closingDate === today ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-4 font-semibold">
                      {c.closingDate === today
                        ? "Hoy"
                        : new Date(c.closingDate + "T12:00:00").toLocaleDateString(
                            "es-DO",
                            { day: "2-digit", month: "2-digit", year: "numeric" }
                          )}
                    </td>
                    <td className="py-2.5 pr-4 text-right">{fmtMoney(c.totalSales)}</td>
                    <td className="py-2.5 pr-4 text-center">{c.ordersCount}</td>
                    <td className="py-2.5 pr-4 text-right">{fmtMoney(c.expectedCash)}</td>
                    <td className="py-2.5 pr-4 text-right">{fmtMoney(c.countedCash)}</td>
                    <td
                      className={`py-2.5 pr-4 text-right font-bold ${
                        Math.round(c.difference) === 0
                          ? "text-green-600"
                          : c.difference > 0
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {fmtMoney(c.difference)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
