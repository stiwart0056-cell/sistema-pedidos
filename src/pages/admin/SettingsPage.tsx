import { useRestaurantConfig } from "@/hooks/useRestaurantConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Store, Phone, MapPin, Quote, Receipt, Printer, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export function SettingsPage() {
  const { config, updateConfig } = useRestaurantConfig();
  const [form, setForm] = useState(config);

  // Sync form when config loads from Supabase
  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleSave = () => {
    updateConfig(form);
  };

  const changed = Object.keys(form).some(
    (key) => (form as any)[key] !== (config as any)[key]
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Configuración del Restaurante
      </h1>

      {/* ── Datos Generales ── */}
      <div className="rounded-2xl border bg-white p-6 space-y-6">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" /> Datos Generales
        </h2>

        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted overflow-hidden border">
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
              Deja vacío para usar el texto del nombre como logo.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" /> Nombre del restaurante *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Teléfono / WhatsApp *
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
            <MapPin className="h-3.5 w-3.5" /> Dirección completa *
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
      </div>

      {/* ── Datos Fiscales (RD) ── */}
      <div className="rounded-2xl border bg-white p-6 space-y-6">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Datos Fiscales (República Dominicana)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> RNC
            </Label>
            <Input
              value={form.rnc || ""}
              onChange={(e) => setForm((p) => ({ ...p, rnc: e.target.value }))}
              className="mt-1"
              placeholder="101-XXXXX-X"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Registro Nacional de Contribuyentes. Aparecerá en el ticket.
            </p>
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> Tipo de NCF
            </Label>
            <Select
              value={form.ncfType || "02"}
              onValueChange={(v) => setForm((p) => ({ ...p, ncfType: v }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">01 - Crédito Fiscal</SelectItem>
                <SelectItem value="02">02 - Consumidor Final</SelectItem>
                <SelectItem value="03">03 - Gastos Menores</SelectItem>
                <SelectItem value="04">04 - Compras Informales</SelectItem>
                <SelectItem value="14">14 - Régimen Especial</SelectItem>
                <SelectItem value="15">15 - Comprobante Gubernamental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> Prefijo NCF
            </Label>
            <Input
              value={form.ncfPrefix || ""}
              onChange={(e) => setForm((p) => ({ ...p, ncfPrefix: e.target.value.toUpperCase() }))}
              className="mt-1 uppercase"
              placeholder="B01"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ej: B01, B02, B14, E31, etc.
            </p>
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> Siguiente Número NCF
            </Label>
            <Input
              type="number"
              value={form.ncfNext || ""}
              onChange={(e) => setForm((p) => ({ ...p, ncfNext: parseInt(e.target.value) || 1 }))}
              className="mt-1"
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Se incrementa automáticamente con cada ticket.
            </p>
          </div>
        </div>
      </div>

      {/* ── Configuración de Ticket / Impresora ── */}
      <div className="rounded-2xl border bg-white p-6 space-y-6">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Printer className="h-5 w-5 text-primary" /> Impresora Térmica
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Ancho de papel (mm)
            </Label>
            <Select
              value={String(form.printerWidth || 58)}
              onValueChange={(v) => setForm((p) => ({ ...p, printerWidth: parseInt(v) as 58 | 80 }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona ancho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="58">58mm (2 pulgadas) — Xprinter XP-58, Gprinter GP-58</SelectItem>
                <SelectItem value="80">80mm (3 pulgadas) — Epson TM-T20, Bixolon SRP-330</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              La mayoría de impresoras en RD usan 58mm o 80mm.
            </p>
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              % ITBIS
            </Label>
            <Input
              type="number"
              step="0.01"
              value={form.taxRate ?? 0.18}
              onChange={(e) => setForm((p) => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
              className="mt-1"
              placeholder="0.18"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={form.showTax ?? true}
            onCheckedChange={(v) => setForm((p) => ({ ...p, showTax: v }))}
          />
          <Label className="cursor-pointer">
            Mostrar ITBIS desglosado en el ticket
          </Label>
        </div>
      </div>

      {/* ── Botón Guardar ── */}
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

      {/* ── Preview del ticket ── */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="font-display text-lg font-bold mb-4">Vista previa del ticket</h2>
        <div
          className="rounded-lg border border-dashed border-gray-300 bg-white p-4 mx-auto overflow-hidden"
          style={{
            maxWidth: form.printerWidth === 80 ? 320 : 220,
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 13,
          }}
        >
          <div className="text-center mb-3 pb-3 border-b border-dashed border-gray-400">
            {form.logo && (
              <img src={form.logo} alt="" className="h-12 mx-auto mb-2 object-contain" />
            )}
            <div className="font-bold text-lg">{form.name || "Restaurante"}</div>
            <div className="text-xs text-gray-600 mt-1">{form.address}</div>
            <div className="text-xs text-gray-600">Tel: {form.phone}</div>
            {form.rnc && <div className="text-xs text-gray-600">RNC: {form.rnc}</div>}
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
