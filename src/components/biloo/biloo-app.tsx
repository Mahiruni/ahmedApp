"use client";

import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  initialDriverJobs,
  initialIncidents,
  initialNotifications,
  initialOrders,
  initialVendorOrders,
  type ActiveOrder,
  type AdminIncident,
  type BilooNotification,
  type CartLine,
  type CatalogItem,
  type DriverJob,
  type PaymentMethod,
  type Role,
  type ServiceKey,
  type VendorOrder,
  catalog,
} from "@/data/biloo";

import { CustomerDashboard } from "./customer-dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { DriverDashboard } from "./driver-dashboard";
import { VendorDashboard } from "./vendor-dashboard";
import { Icon, serviceLabel } from "./ui";
import { AppHeader, RoleRail } from "./app-shell";
import { CartDrawer } from "./cart-drawer";
import { CheckoutModal } from "./checkout-modal";
import { NotificationsDrawer } from "./notifications-drawer";
import { TrackingModal } from "./tracking-modal";

const vendorStatusOrder: VendorOrder["status"][] = [
  "New",
  "Accepted",
  "Preparing",
  "Ready",
  "Dispatched",
];

function useStoredState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(key);
        if (stored && !cancelled) setValue(JSON.parse(stored) as T);
      } catch {
        // A corrupted or blocked storage entry should never break the app.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable in privacy mode; in-memory state still works.
    }
  }, [hydrated, key, value]);

  return [value, setValue];
}

function createOrderId() {
  return `BL-${Math.floor(10000 + Math.random() * 89999)}`;
}

function currentTime() {
  return `Today · ${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date())}`;
}

function paymentMethodLabel(method: PaymentMethod) {
  if (method === "wallet") return "BILOO Wallet";
  if (method === "card") return "online payment";
  return "cash on delivery";
}

export function BilooApp() {
  const [role, setRole] = useStoredState<Role>("biloo.role", "customer");
  const [service, setService] = useStoredState<ServiceKey>(
    "biloo.service",
    "food",
  );
  const [search, setSearch] = useState("");
  const [cart, setCart] = useStoredState<CartLine[]>("biloo.cart", []);
  const [orders, setOrders] = useStoredState<ActiveOrder[]>(
    "biloo.orders",
    initialOrders,
  );
  const [notifications, setNotifications] = useStoredState<
    BilooNotification[]
  >("biloo.notifications", initialNotifications);
  const [vendorOrders, setVendorOrders] = useStoredState<VendorOrder[]>(
    "biloo.vendor-orders",
    initialVendorOrders,
  );
  const [incidents, setIncidents] = useStoredState<AdminIncident[]>(
    "biloo.incidents",
    initialIncidents,
  );

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ActiveOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState(
    "Home · Bole, Addis Ababa",
  );

  const [driverOnline, setDriverOnline] = useState(true);
  const [driverJobs, setDriverJobs] = useState<DriverJob[]>(initialDriverJobs);
  const [activeDriverJob, setActiveDriverJob] = useState<DriverJob | null>(null);
  const [driverEarnings, setDriverEarnings] = useState(2460);
  const [driverCompleted, setDriverCompleted] = useState(14);
  const [storeOpen, setStoreOpen] = useState(true);

  const catalogItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (item.service !== service) return false;
      if (!normalized) return true;
      return `${item.name} ${item.merchant} ${item.category} ${item.description}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [search, service]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const overlayOpen =
      cartOpen || checkoutOpen || notificationsOpen || Boolean(selectedOrder);
    if (!overlayOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [cartOpen, checkoutOpen, notificationsOpen, selectedOrder]);

  function notify(title: string, message: string) {
    const notification: BilooNotification = {
      id: `notification-${Date.now()}`,
      title,
      message,
      time: "Now",
      read: false,
    };
    setNotifications((current) => [notification, ...current]);
  }

  function addToCart(item: CatalogItem) {
    const existingService = cart[0]?.item.service;
    if (existingService && existingService !== item.service) {
      setToast(
        `Your cart contains ${serviceLabel(existingService)} items. Complete or clear it before starting another order.`,
      );
      setCartOpen(true);
      return;
    }

    setCart((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (existing) {
        return current.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...current, { item, quantity: 1 }];
    });
    setToast(`${item.name} added to your cart.`);
  }

  function updateCartQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((current) =>
        current.filter((line) => line.item.id !== itemId),
      );
      return;
    }
    setCart((current) =>
      current.map((line) =>
        line.item.id === itemId ? { ...line, quantity } : line,
      ),
    );
  }

  function confirmCheckout(paymentMethod: PaymentMethod) {
    if (!cart.length) return;
    const subtotal = cart.reduce(
      (total, line) => total + line.item.price * line.quantity,
      0,
    );
    const total = subtotal + 75 + Math.round(subtotal * 0.025);
    const orderService = cart[0].item.service;
    const merchant = cart[0].item.merchant;
    const order: ActiveOrder = {
      id: createOrderId(),
      service: orderService,
      title: `${merchant} order`,
      status: "Vendor is confirming your order",
      eta: orderService === "construction" ? "2–4 hrs" : "28 min",
      progress: 16,
      total,
      createdAt: currentTime(),
    };

    setOrders((current) => [order, ...current]);
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    notify(
      "Order placed",
      `${order.id} was placed using ${paymentMethodLabel(paymentMethod)}.`,
    );
    setToast(`Order ${order.id} placed successfully.`);
    setSelectedOrder(order);
  }

  function bookTaxi(booking: {
    pickup: string;
    dropoff: string;
    rideName: string;
    fare: number;
  }) {
    if (!booking.pickup.trim() || !booking.dropoff.trim()) {
      setToast("Enter both pickup and destination before booking.");
      return;
    }

    const order: ActiveOrder = {
      id: createOrderId(),
      service: "taxi",
      title: `${booking.rideName} to ${booking.dropoff}`,
      status: "Matching you with a nearby driver",
      eta: "3 min",
      progress: 12,
      total: booking.fare,
      createdAt: currentTime(),
    };

    setOrders((current) => [order, ...current]);
    notify(
      "Ride requested",
      `We are finding a driver from ${booking.pickup} to ${booking.dropoff}.`,
    );
    setToast("Ride request sent. A driver is being matched.");
    setSelectedOrder(order);
  }

  function locateCustomer() {
    if (!navigator.geolocation) {
      setToast("Location services are not available on this device.");
      return;
    }

    setLocationLabel("Locating your device…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLabel(
          `Current location · ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        );
        setToast("Current location updated.");
      },
      () => {
        setLocationLabel("Home · Bole, Addis Ababa");
        setToast("Location permission was not granted. Using your saved address.");
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 },
    );
  }

  function acceptDriverJob(job: DriverJob) {
    setActiveDriverJob(job);
    setDriverJobs((current) => current.filter((item) => item.id !== job.id));
    setToast(`${job.id} accepted. Navigation is ready.`);
  }

  function completeDriverJob() {
    if (!activeDriverJob) return;
    setDriverEarnings((current) => current + activeDriverJob.amount);
    setDriverCompleted((current) => current + 1);
    setToast(`${activeDriverJob.id} completed and earnings updated.`);
    setActiveDriverJob(null);
  }

  function advanceVendorOrder(order: VendorOrder) {
    const currentIndex = vendorStatusOrder.indexOf(order.status);
    const nextStatus = vendorStatusOrder[currentIndex + 1] ?? order.status;
    setVendorOrders((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, status: nextStatus } : item,
      ),
    );
    setToast(`${order.id} moved to ${nextStatus}.`);
  }

  function resolveIncident(incident: AdminIncident) {
    setIncidents((current) =>
      current.map((item) =>
        item.id === incident.id ? { ...item, resolved: true } : item,
      ),
    );
    setToast(`${incident.id} marked as resolved.`);
  }

  function openNotifications() {
    setNotificationsOpen(true);
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f5f7] text-[#10243a]">
      <AppHeader
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenNotifications={openNotifications}
        unreadCount={unreadCount}
      />

      <div className="mx-auto grid max-w-[1540px] lg:grid-cols-[270px_minmax(0,1fr)]">
        <RoleRail role={role} setRole={setRole} />

        <section className="min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          {role === "customer" ? (
            <CustomerDashboard
              cart={cart}
              catalogItems={catalogItems}
              locationLabel={locationLabel}
              onAddToCart={addToCart}
              onBookTaxi={bookTaxi}
              onLocate={locateCustomer}
              onOpenCart={() => setCartOpen(true)}
              onTrackOrder={setSelectedOrder}
              orders={orders}
              search={search}
              service={service}
              setSearch={setSearch}
              setService={setService}
            />
          ) : null}

          {role === "driver" ? (
            <DriverDashboard
              activeJob={activeDriverJob}
              completed={driverCompleted}
              earnings={driverEarnings}
              jobs={driverJobs}
              onAccept={acceptDriverJob}
              onComplete={completeDriverJob}
              online={driverOnline}
              setOnline={setDriverOnline}
            />
          ) : null}

          {role === "vendor" ? (
            <VendorDashboard
              onAdvanceOrder={advanceVendorOrder}
              orders={vendorOrders}
              setStoreOpen={setStoreOpen}
              storeOpen={storeOpen}
            />
          ) : null}

          {role === "admin" ? (
            <AdminDashboard
              incidents={incidents}
              onResolveIncident={resolveIncident}
            />
          ) : null}
        </section>
      </div>

      <CartDrawer
        cart={cart}
        onCheckout={() => setCheckoutOpen(true)}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        open={cartOpen}
      />
      <CheckoutModal
        cart={cart}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={confirmCheckout}
        open={checkoutOpen}
      />
      <NotificationsDrawer
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        open={notificationsOpen}
      />
      <TrackingModal
        onAdvance={(order) => {
          const nextProgress = Math.min(order.progress + 18, 96);
          const updated: ActiveOrder = {
            ...order,
            progress: nextProgress,
            status:
              nextProgress >= 90
                ? "Arriving at your location"
                : "Your order is moving through the route",
            eta: nextProgress >= 90 ? "2 min" : order.eta,
          };
          setOrders((current) =>
            current.map((item) => (item.id === order.id ? updated : item)),
          );
          setSelectedOrder(updated);
        }}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[100] flex w-[min(92vw,520px)] -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#082640] px-4 py-3 text-sm font-bold text-white shadow-2xl">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
            <Icon className="size-4" name="check" />
          </span>
          <span className="min-w-0 flex-1">{toast}</span>
          <button
            aria-label="Dismiss notification"
            className="grid size-8 place-items-center rounded-full bg-white/10"
            onClick={() => setToast(null)}
            type="button"
          >
            <Icon className="size-4" name="close" />
          </button>
        </div>
      ) : null}
    </main>
  );
}
