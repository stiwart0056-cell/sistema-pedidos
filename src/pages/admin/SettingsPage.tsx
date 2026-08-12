import { useRestaurantConfig } from "@/hooks/useRestaurantConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Store, Phone, MapPin, Quote } from "lucide-react";
import { useState } from "react";

export function SettingsPage() {
  const { config, updateConfig } = useRestaurantConfig();
  const [form, setForm] = useState(config);

  const handleSave = () => {
    updateConfig(form);
  };

  const changed =
    form.name !== config.name ||
    form.phone !== config.phone ||
    form.address !== config.address ||
    form.slogan !== config.slogan ||
    form.logo !== config.logo;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Configuración del Restaurante
      </h1>

      <div className="rounded-2xl border bg-white p-6 space-y-6">
        {/* Logo preview */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted overflow-hidden">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Store className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <Label className="text-sm font-semibold">Logo URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={form.logo || ""}
                onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
                placeholder="https://... o /logo.png"
              />
              <Button size="icon" variant="ghost" onClick={() => setForm((p) => ({ ...p, logo: "" }))}>
                ✕
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deja vacío para usar el ícono por defecto.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" /> Nombre del restaurante
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Teléfono / WhatsApp
            </Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="mt-1"
              placeholder="1809..."
            />
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Dirección
          </Label>
          <Input
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="flex items-center gap-1.5">
            <Quote className="h-3.5 w-3.5" /> Slogan (opcional)
          </Label>
          <Input
            value={form.slogan || ""}
            onChange={(e) => setForm((p) => ({ ...p, slogan: e.target.value }))}
            className="mt-1"
            placeholder="¡El mejor sabor de la ciudad!"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={!changed}
            className="gap-2 rounded-full"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
          {changed && (
            <span className="text-xs text-muted-foreground">
              Hay cambios sin guardar
            </span>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="font-display text-lg font-bold mb-4">Vista previa del ticket</h2>
        <div
          className="rounded-lg border border-dashed border-gray-300 bg-white p-4 mx-auto"
          style={{ maxWidth: 320, fontFamily: '"Courier New", Courier, monospace', fontSize: 13 }}
        >
          <div className="text-center mb-3 pb-3 border-b border-dashed border-gray-400">
            {form.logo && (
              <img src={form.logo} alt="" className="h-12 mx-auto mb-2 object-contain" />
            )}
            <div className="font-bold text-lg">{form.name || "Restaurante"}</div>
            <div className="text-xs text-gray-600 mt-1">{form.address}</div>
            <div className="text-xs text-gray-600">Tel: {form.phone}</div>
            {form.slogan && <div className="text-xs text-gray-500 mt-1 italic">{form.slogan}</div>}
          </div>
          <div className="text-center text-xs text-gray-400">
            --- Vista previa ---
          </div>
        </div>
      </div>
    </div>
  );
}
