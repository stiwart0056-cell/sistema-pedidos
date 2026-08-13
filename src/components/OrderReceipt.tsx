import { useRef } from "react";
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
  const { config } = useRestaurantConfig();

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow || !receiptRef.current) return;

    const receiptHTML = receiptRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: "Courier New", Courier, monospace;
              font-size: 13px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              padding: 16px;
              max-width: 320px;
              margin: 0 auto;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px dashed #000;
            }
            .receipt-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .receipt-meta {
              font-size: 11px;
              color: #333;
            }
            .receipt-section {
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #000;
            }
            .receipt-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .receipt-item-name {
              flex: 1;
            }
            .receipt-item-qty {
              width: 30px;
              text-align: center;
            }
            .receipt-item-price {
              width: 70px;
              text-align: right;
            }
            .receipt-total {
              font-size: 15px;
              font-weight: bold;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #000;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 16px;
              font-size: 11px;
              color: #333;
            }
            .receipt-note {
              font-style: italic;
              font-size: 11px;
              margin-top: 6px;
              padding: 6px;
              background: #f9f9f9;
              border-radius: 4px;
            }
            .receipt-discount {
              color: #16a34a;
            }
            @media print {
              body { padding: 0; }
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
              }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const subtotal = order.total;
  const taxRate = 0.18;
  const tax = Math.round((subtotal - (order.discount || 0)) * taxRate);
  const totalWithTax = subtotal + tax - (order.discount || 0);

  const typeLabel =
    order.type === "delivery"
      ? "🛵 Delivery"
      : order.type === "dine-in"
      ? `🪑 Mesa ${order.tableNumber}`
      : "🏠 Recoger en local";

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
            className="rounded-lg border border-dashed border-gray-300 bg-white p-4"
            style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: 13 }}
          >
            <div className="text-center mb-3 pb-3 border-b border-dashed border-gray-400">
              {config.logo && (
                <img src={config.logo} alt="" className="h-12 mx-auto mb-2 object-contain" />
              )}
              <div className="font-bold text-lg">{config.name}</div>
              <div className="text-xs text-gray-600 mt-1">{config.address}</div>
              <div className="text-xs text-gray-600">Tel: {config.phone}</div>
              {config.slogan && <div className="text-xs text-gray-500 mt-1 italic">{config.slogan}</div>}
            </div>

            <div className="mb-3 pb-3 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Orden:</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span>{typeLabel}</span>
              </div>
            </div>

            {order.customer && (
              <div className="mb-3 pb-3 border-b border-dashed border-gray-400 text-xs">
                <div className="font-semibold mb-1">Cliente:</div>
                <div>{order.customer.name}</div>
                <div>📞 {order.customer.phone}</div>
                {order.customer.address && <div>📍 {order.customer.address}</div>}
              </div>
            )}

            <div className="mb-3 pb-3 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-semibold mb-1 text-xs uppercase tracking-wide">
                <span className="flex-1">Descripción</span>
                <span className="w-8 text-center">Cant</span>
                <span className="w-16 text-right">Precio</span>
              </div>
              {order.items.map((item) => (
                <div key={item.cartId} className="flex justify-between py-0.5">
                  <span className="flex-1">
                    {item.name}
                    {item.variant && (
                      <span className="text-gray-500"> ({item.variant})</span>
                    )}
                  </span>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="w-16 text-right">
                    RD$ {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-3 pb-3 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>RD$ {subtotal.toLocaleString()}</span>
              </div>
              {order.discount !== undefined && order.discount > 0 && (
                <div className="flex justify-between receipt-discount">
                  <span>Descuento ({order.couponCode}):</span>
                  <span>-RD$ {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ITBIS (18%):</span>
                <span>RD$ {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-1 pt-1 border-t border-gray-400">
                <span>TOTAL:</span>
                <span>RD$ {totalWithTax.toLocaleString()}</span>
              </div>
            </div>

            {order.customer?.notes && (
              <div className="mb-3 pb-3 border-b border-dashed border-gray-400">
                <div className="font-semibold text-xs mb-1">Nota:</div>
                <div className="text-xs italic bg-gray-50 p-2 rounded">
                  {order.customer.notes}
                </div>
              </div>
            )}

            <div className="text-center text-xs text-gray-500 mt-2">
              <div>¡Gracias por su preferencia!</div>
              <div className="mt-1">{config.name}</div>
              <div className="mt-2">--- *** ---</div>
            </div>
          </div>

          <Button onClick={handlePrint} className="w-full mt-4 gap-2 rounded-full">
            <Printer className="h-4 w-4" />
            Imprimir Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
