import { useState } from "react";
import { useCoupons } from "@/hooks/useCoupons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Tag, Percent, DollarSign, Calendar } from "lucide-react";

export function CouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as const,
    discountValue: 0,
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const handleSubmit = () => {
    if (!form.code.trim() || form.discountValue <= 0) return;
    addCoupon({
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      minOrderAmount: form.minOrderAmount ? parseInt(form.minOrderAmount) : undefined,
      maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      expiresAt: form.expiresAt || undefined,
      isActive: true,
    });
    setForm({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderAmount: "",
      maxUses: "",
      expiresAt: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Cupones</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 rounded-full font-display font-bold"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cupón
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="font-display text-lg font-bold">Crear Cupón</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Código
              </Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="TOASTED20"
                className="uppercase mt-1"
              />
            </div>
            <div>
              <Label>Tipo de descuento</Label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setForm((p) => ({ ...p, discountType: "percentage" }))}
                  className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium ${
                    form.discountType === "percentage"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Percent className="h-4 w-4" /> %
                </button>
                <button
                  onClick={() => setForm((p) => ({ ...p, discountType: "fixed" }))}
                  className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium ${
                    form.discountType === "fixed"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <DollarSign className="h-4 w-4" /> Fijo
                </button>
              </div>
            </div>
            <div>
              <Label>Valor ({form.discountType === "percentage" ? "%" : "RD$"})</Label>
              <Input
                type="number"
                min={0}
                value={form.discountValue || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discountValue: parseInt(e.target.value) || 0 }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Mínimo de compra (RD$)</Label>
              <Input
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
                placeholder="Opcional"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Usos máximos</Label>
              <Input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                placeholder="Ilimitado"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Expira
              </Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={handleSubmit} className="rounded-full">
            Crear Cupón
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="rounded-2xl border bg-white py-16 text-center text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No hay cupones aún</p>
            <p className="text-sm">Crea cupones para atraer más clientes</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`rounded-full ${
                      coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {coupon.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <span className="font-display text-lg font-bold">{coupon.code}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% de descuento`
                    : `RD$ ${coupon.discountValue.toLocaleString()} de descuento`}
                  {coupon.minOrderAmount ? ` · Mínimo RD$ ${coupon.minOrderAmount.toLocaleString()}` : ""}
                  {coupon.maxUses ? ` · ${coupon.usesCount}/${coupon.maxUses} usados` : ` · ${coupon.usesCount} usados`}
                  {coupon.expiresAt ? ` · Expira ${new Date(coupon.expiresAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCoupon(coupon.id, { isActive: !coupon.isActive })}
                >
                  {coupon.isActive ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteCoupon(coupon.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
