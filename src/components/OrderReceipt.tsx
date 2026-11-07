import { useRef, useState } from "react";
import type { Order } from "@/types";
import { useRestaurantConfig } from "@/hooks/useRestaurantConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";

interface OrderReceiptProps {
  order: Order;
  trigger?: React.ReactNode;
}

export function OrderReceipt({ order, trigger }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { config, getNextNCF } = useRestaurantConfig();
  const [ncfNumber, setNcfNumber] = useState<string | null>(null);

  const width = config.printerWidth === 80 ? 320 : 220;
  const charsPerLine = config.printerWidth === 80 ? 48 : 32;
  const fontSize = config.printerWidth === 80 ? 13 : 12;

  const handlePrint = async () => {
    // Generate NCF if configured
    let ncf = null;
    if (config.ncfPrefix && config.ncfType) {
      ncf = await getNextNCF();
      setNcfNumber(ncf);
    }

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow || !receiptRef.current) return;

    const receiptHTML = receiptRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${order.id}</title>
          <style>
            @page { margin: 0; size: auto; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: "Courier New", Courier, monospace;
              font-size: ${fontSize}px;
              line-height: 1.3;
              color: #000;
              background: #fff;
              padding: 8px;
              width: ${width}px;
              margin: 0 auto;
            }
            .receipt-header { text-align: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #000; }
            .receipt-title { font-size: ${fontSize + 4}px; font-weight: bold; margin-bottom: 2px; }
            .receipt-meta { font-size: ${fontSize - 1}px; color: #333; }
            .receipt-section { margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dashed #000; }
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 1px; }
            .receipt-item { display: flex; justify-content: space-between; }
            .receipt-item-name { flex: 1; word-break: break-word; }
            .receipt-item-qty { width: 24px; text-align: center; flex-shrink: 0; }
            .receipt-item-price { width: 60px; text-align: right; flex-shrink: 0; }
            .receipt-total { font-size: ${fontSize + 1}px; font-weight: bold; margin-top: 4px; padding-top: 4px; border-top: 1px solid #000; }
            .receipt-footer { text-align: center; margin-top: 12px; font-size: ${fontSize - 1}px; color: #333; }
            .receipt-ncf { text-align: center; font-size: ${fontSize}px; font-weight: bold; margin: 4px 0; padding: 4px; border: 1px dashed #000; }
            .receipt-divider { text-align: center; font-size: ${fontSize - 2}px; letter-spacing: 2px; margin: 4px 0; }
            @media print {
              body { padding: 0; width: ${width}px !important; }
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const subtotal = order.total;
  const discount = order.discount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const taxRate = config.taxRate ?? 0.18;
  const taxableBase = subtotal - discount;
  const tax = config.showTax ? Math.round(taxableBase * taxRate) : 0;
  const total = subtotal + deliveryFee - discount + tax;

  const typeLabel =
    order.type === "delivery"
      ? "DELIVERY"
      : order.type === "dine-in"
      ? `MESA ${order.tableNumber}`
      : "PARA LLEVAR";

  // Helpers for text alignment
  const padLine = (left: string, right: string): string => {
    const totalLen = charsPerLine;
    const leftLen = left.length;
    const rightLen = right.length;
    const spaces = totalLen - leftLen - rightLen;
    if (spaces <= 0) return left + " " + right;
    return left + " ".repeat(spaces) + right;
  };

  const divider = "-".repeat(charsPerLine);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1 rounded-full">
            <Printer className="h-3.5 w-3.5" />
            Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-display text-lg">Ticket de Pedido</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div
            ref={receiptRef}
            style={{
              fontFamily: '"Courier New", Courier, monospace',
              fontSize,
              width,
              margin: "0 auto",
              background: "#fff",
              color: "#000",
              lineHeight: 1.3,
            }}
          >
            {/* HEADER */}
            <div style={{ textAlign: "center", marginBottom: 8, paddingBottom: 8, borderBottom: "1px dashed #000" }}>
              {config.logo && (
                <img src={config.logo} alt="" style={{ maxHeight: 48, margin: "0 auto 4px", display: "block" }} />
              )}
              <div style={{ fontSize: fontSize + 4, fontWeight: "bold" }}>{config.name}</div>
              <div style={{ fontSize: fontSize - 1 }}>{config.address}</div>
              <div style={{ fontSize: fontSize - 1 }}>Tel: {config.phone}</div>
              {config.rnc && <div style={{ fontSize: fontSize - 1 }}>RNC: {config.rnc}</div>}
              {config.slogan && <div style={{ fontSize: fontSize - 1, fontStyle: "italic" }}>{config.slogan}</div>}
            </div>

            {/* NCF */}
            {(ncfNumber || config.ncfType) && (
              <div style={{ textAlign: "center", marginBottom: 6, padding: "4px 0", border: "1px dashed #000" }}>
                <div style={{ fontSize: fontSize - 1 }}>
                  NCF: {ncfNumber || `${config.ncfPrefix || "B01"}XXXXXXX`}
                </div>
                <div style={{ fontSize: fontSize - 2 }}>
                  {config.ncfType === "01" && "Crédito Fiscal"}
                  {config.ncfType === "02" && "Consumidor Final"}
                  {config.ncfType === "03" && "Gastos Menores"}
                  {config.ncfType === "04" && "Compras Informales"}
                  {config.ncfType === "14" && "Régimen Especial"}
                  {config.ncfType === "15" && "Comprobante Gubernamental"}
                </div>
              </div>
            )}

            {/* ORDER INFO */}
            <div style={{ marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #000" }}>
              <div>{padLine("Orden:", order.id.slice(-8).toUpperCase())}</div>
              <div>{padLine("Fecha:", new Date(order.createdAt).toLocaleString("es-DO"))}</div>
              <div>{padLine("Tipo:", typeLabel)}</div>
              {order.tableNumber && (
                <div>{padLine("Mesa:", String(order.tableNumber))}</div>
              )}
            </div>

            {/* CUSTOMER */}
            {order.customer && (
              <div style={{ marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #000", fontSize: fontSize - 1 }}>
                <div style={{ fontWeight: "bold" }}>CLIENTE:</div>
                <div>{order.customer.name}</div>
                <div>Tel: {order.customer.phone}</div>
                {order.customer.address && <div>{order.customer.address}</div>}
              </div>
            )}

            {/* ITEMS */}
            <div style={{ marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #000" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginBottom: 2 }}>
                <span style={{ flex: 1 }}>DESCRIPCION</span>
                <span style={{ width: 24, textAlign: "center" }}>CT</span>
                <span style={{ width: 60, textAlign: "right" }}>PRECIO</span>
              </div>
              {order.items.map((item) => (
                <div key={item.cartId} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ flex: 1, wordBreak: "break-word" }}>
                    {item.name}
                    {item.variant && <span style={{ fontSize: fontSize - 2 }}> ({item.variant})</span>}
                  </span>
                  <span style={{ width: 24, textAlign: "center" }}>{item.quantity}</span>
                  <span style={{ width: 60, textAlign: "right" }}>
                    RD${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div style={{ marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #000" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal:</span>
                <span>RD${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                  <span>Descuento{order.couponCode ? ` (${order.couponCode})` : ""}:</span>
                  <span>-RD${discount.toLocaleString()}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Delivery:</span>
                  <span>+RD${deliveryFee.toLocaleString()}</span>
                </div>
              )}
              {config.showTax && tax > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>ITBIS ({(taxRate * 100).toFixed(0)}%):</span>
                  <span>RD${tax.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: fontSize + 1, marginTop: 4, paddingTop: 4, borderTop: "1px solid #000" }}>
                <span>TOTAL:</span>
                <span>RD${total.toLocaleString()}</span>
              </div>
            </div>

            {/* NOTES */}
            {order.customer?.notes && (
              <div style={{ marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #000", fontSize: fontSize - 1 }}>
                <div style={{ fontWeight: "bold" }}>NOTA:</div>
                <div>{order.customer.notes}</div>
              </div>
            )}

            {/* FOOTER */}
            <div style={{ textAlign: "center", fontSize: fontSize - 1, marginTop: 8 }}>
              <div>{divider}</div>
              <div>Gracias por su preferencia!</div>
              <div>{config.name}</div>
              {config.rnc && <div>RNC: {config.rnc}</div>}
              <div style={{ marginTop: 4 }}>***</div>
            </div>
          </div>

          <Button onClick={handlePrint} className="w-full mt-4 gap-2 rounded-full">
            <Printer className="h-4 w-4" />
            Imprimir Ticket
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {config.printerWidth === 80
              ? "Optimizado para impresoras 80mm (Epson TM-T20, Bixolon SRP-330)"
              : "Optimizado para impresoras 58mm (Xprinter XP-58, Gprinter GP-58)"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
