import { useState } from "react";
import { useDeliveryZones } from "@/hooks/useDeliveryZones";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Truck, MapPin } from "lucide-react";

export function DeliveryZonesPage() {
  const { zones, addZone, updateZone, deleteZone } = useDeliveryZones();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    fee: 0,
    minOrderAmount: "",
  });

  const handleSubmit = () => {
    if (!form.name.trim() || form.fee < 0) return;
    addZone({
      name: form.name.trim(),
      fee: form.fee,
      minOrderAmount: form.minOrderAmount ? parseInt(form.minOrderAmount) : undefined,
      isActive: true,
    });
    setForm({ name: "", fee: 0, minOrderAmount: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Zonas de Delivery</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 rounded-full font-display font-bold"
        >
          <Plus className="h-4 w-4" />
          Nueva Zona
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="font-display text-lg font-bold">Crear Zona</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Nombre de la zona
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ej: Zona Centro"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tarifa de delivery (RD$)</Label>
              <Input
                type="number"
                min={0}
                value={form.fee || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fee: parseInt(e.target.value) || 0 }))
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
          </div>
          <Button onClick={handleSubmit} className="rounded-full">
            Crear Zona
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {zones.length === 0 ? (
          <div className="rounded-2xl border bg-white py-16 text-center text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No hay zonas configuradas</p>
            <p className="text-sm">Crea zonas de delivery para cobrar tarifas por área</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`rounded-full ${
                      zone.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {zone.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                  <span className="font-display text-lg font-bold">{zone.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tarifa: RD$ {zone.fee.toLocaleString()}
                  {zone.minOrderAmount ? ` · Mínimo RD$ ${zone.minOrderAmount.toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateZone(zone.id, { isActive: !zone.isActive })}
                >
                  {zone.isActive ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteZone(zone.id)}
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
