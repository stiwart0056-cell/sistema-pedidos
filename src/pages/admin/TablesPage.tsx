import { useTables } from "@/hooks/useTables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Printer, Trash2 } from "lucide-react";

function getQRUrl(tableNumber: number) {
  const base = window.location.origin;
  return `${base}/?table=${tableNumber}`;
}

export function TablesPage() {
  const { tables, toggleStatus, addTable, removeTable } = useTables();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Mesas & QR Codes
        </h1>
        <Button
          onClick={addTable}
          className="gap-2 rounded-full font-display font-bold"
        >
          <Plus className="h-4 w-4" />
          Agregar Mesa
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => {
          const qrUrl = getQRUrl(table.number);
          const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
          return (
            <div
              key={table.id}
              className="flex flex-col items-center gap-3 rounded-2xl border bg-white p-5"
            >
              <div className="flex w-full items-center justify-between">
                <h3 className="font-display text-xl font-bold">
                  Mesa {table.number}
                </h3>
                <Badge
                  className={`rounded-full ${
                    table.status === "free"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {table.status === "free" ? "Libre" : "Ocupada"}
                </Badge>
              </div>

              <div className="rounded-xl border bg-white p-2">
                <img
                  src={qrImage}
                  alt={`QR Mesa ${table.number}`}
                  className="h-40 w-40"
                />
              </div>

              <p className="text-center text-xs text-muted-foreground break-all">
                {qrUrl}
              </p>

              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 rounded-lg"
                  onClick={() => toggleStatus(table.id)}
                >
                  {table.status === "free" ? "Ocupar" : "Liberar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 rounded-lg"
                  onClick={() => window.open(qrImage, "_blank")}
                >
                  <Printer className="h-3 w-3" />
                  Imprimir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeTable(table.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
