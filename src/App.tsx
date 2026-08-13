import { Routes, Route, useSearchParams } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { MenuSection } from "@/components/MenuSection";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { useMenuManager } from "@/hooks/useMenuManager";
import { useTables } from "@/hooks/useTables";
import { useCategories } from "@/hooks/useCategories";
import type { Order } from "@/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { OrdersPage } from "@/pages/admin/OrdersPage";
import { MenuEditorPage } from "@/pages/admin/MenuEditorPage";
import { TablesPage } from "@/pages/admin/TablesPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { CouponsPage } from "@/pages/admin/CouponsPage";
import { DeliveryZonesPage } from "@/pages/admin/DeliveryZonesPage";
import { KitchenPage } from "@/pages/KitchenPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function CustomerApp() {
  const cart = useCart();
  const orders = useOrders();
  const { items, decrementStock } = useMenuManager();
  const { tables } = useTables();
  const { categories } = useCategories();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const matchedTable = tables.find((t) => t.number === parseInt(tableParam || "", 10));

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    const sections = categories.map((cat) => document.getElementById(`cat-${cat}`));
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("cat-", "");
            setActiveCategory(id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => {
      if (section) observerRef.current?.observe(section);
    });
    return () => observerRef.current?.disconnect();
  }, [items, categories]);

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    const el = document.getElementById(`cat-${category}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleConfirm = useCallback(
    (options: {
      type: Order["type"];
      tableId?: string;
      tableNumber?: number;
      customer?: Order["customer"];
      discount?: number;
      couponCode?: string;
      deliveryFee?: number;
      deliveryZoneId?: string;
    }) => {
      if (cart.items.length === 0) return;
      const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const discount = options.discount || 0;
      const deliveryFee = options.deliveryFee || 0;
      const finalTotal = Math.max(0, total - discount + deliveryFee);
      const order: Order = {
        id: `ORD-${Date.now()}`,
        items: [...cart.items],
        total,
        discount,
        couponCode: options.couponCode,
        deliveryFee,
        deliveryZoneId: options.deliveryZoneId,
        finalTotal,
        createdAt: new Date().toISOString(),
        status: "pending",
        type: options.type,
        tableId: options.tableId,
        tableNumber: options.tableNumber,
        customer: options.customer,
      };
      orders.addOrder(order);
      // Decrement stock for each item
      cart.items.forEach((item) => {
        decrementStock(item.id, item.quantity);
      });
      cart.clearCart();
    },
    [cart, orders, decrementStock]
  );

  return (
    <div className="relative min-h-screen bg-background pb-24">
      {matchedTable && (
        <div className="sticky top-0 z-50 bg-primary py-2 text-center text-sm font-bold text-primary-foreground">
          🪑 Estás ordenando desde la Mesa {matchedTable.number}
        </div>
      )}
      <Header />
      <CategoryNav activeCategory={activeCategory} onSelect={handleSelectCategory} />

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {categories.map((category) => (
          <MenuSection key={category} category={category} items={items} onAdd={cart.addItem} />
        ))}
      </main>

      <CartDrawer
        items={cart.items}
        totalItems={cart.totalItems}
        totalPrice={cart.totalPrice}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeItem}
        onClear={cart.clearCart}
        onConfirm={handleConfirm}
        defaultTableId={matchedTable?.id}
        defaultTableNumber={matchedTable?.number}
      />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerApp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute>
            <KitchenPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={<MenuEditorPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="zones" element={<DeliveryZonesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
