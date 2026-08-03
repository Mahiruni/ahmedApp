"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  initialDriverJobs,
  initialIncidents,
  initialNotifications as demoInitialNotifications,
  initialOrders as demoInitialOrders,
  initialVendorOrders,
  type ActiveOrder,
  type AdminIncident,
  type BilooNotification,
  type CartLine,
  type CatalogItem,
  type DriverJob,
  type IconName,
  type PaymentMethod,
  type Role,
  type ServiceKey,
  type VendorOrder,
  catalog,
} from "@/data/biloo";

import type { AppViewer } from "@/lib/biloo/auth";
import { useBilooRealtime } from "@/hooks/use-biloo-realtime";

import { CustomerDashboard } from "./customer-dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { DriverDashboard } from "./driver-dashboard";
import { VendorDashboard } from "./vendor-dashboard";
import { Icon, serviceLabel, Surface } from "./ui";
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

const driverStageStorageKey = "biloo.driver-active-stage";

type DriverStage = "accepted" | "at_pickup" | "picked_up" | "at_dropoff";

function useStoredState<T>(
  key: string,
  initialValue: T,
  enabled = true,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!enabled) return;
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
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable in privacy mode; in-memory state still works.
    }
  }, [enabled, hydrated, key, value]);

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

function linkedOrderIdFromJob(job: DriverJob | null) {
  if (!job?.id.startsWith("JOB-BL-")) return null;
  return job.id.slice(4);
}

function linkedJobId(orderId: string) {
  return `JOB-${orderId}`;
}

function orderStageLabel(
  order: ActiveOrder,
  vendorOrders: VendorOrder[],
  driverJobs: DriverJob[],
  activeDriverJob: DriverJob | null,
) {
  if (order.progress >= 100) return "Completed";
  if (activeDriverJob?.id === linkedJobId(order.id)) return "Driver active";
  if (driverJobs.some((job) => job.id === linkedJobId(order.id))) {
    return "Awaiting driver";
  }
  const vendorOrder = vendorOrders.find((item) => item.id === order.id);
  if (vendorOrder) return `Vendor · ${vendorOrder.status}`;
  return order.service === "taxi" ? "Matching driver" : "Customer order";
}

export function BilooApp({
  viewer = null,
  initialRemoteOrders = [],
  initialRemoteNotifications = [],
  initialCatalog = catalog,
  liveData = false,
}: {
  viewer?: AppViewer | null;
  initialRemoteOrders?: ActiveOrder[];
  initialRemoteNotifications?: BilooNotification[];
  initialCatalog?: CatalogItem[];
  liveData?: boolean;
}) {
  const [role, setRole] = useStoredState<Role>(
    "biloo.role",
    viewer?.uiRole ?? "customer",
    !liveData,
  );
  const [service, setService] = useStoredState<ServiceKey>(
    "biloo.service",
    "food",
    !liveData,
  );
  const [search, setSearch] = useState("");
  const [cart, setCart] = useStoredState<CartLine[]>(
    "biloo.cart",
    [],
    !liveData,
  );
  const [orders, setOrders] = useStoredState<ActiveOrder[]>(
    "biloo.orders",
    liveData ? initialRemoteOrders : demoInitialOrders,
    !liveData,
  );
  const [notifications, setNotifications] = useStoredState<
    BilooNotification[]
  >(
    "biloo.notifications",
    liveData ? initialRemoteNotifications : demoInitialNotifications,
    !liveData,
  );
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
  const [locationLabel, setLocationLabel] = useStoredState(
    "biloo.customer-location",
    "Home · Bole, Addis Ababa",
    !liveData,
  );

  const [driverOnline, setDriverOnline] = useStoredState(
    "biloo.driver-online",
    true,
    !liveData,
  );
  const [driverJobs, setDriverJobs] = useStoredState<DriverJob[]>(
    "biloo.driver-jobs",
    initialDriverJobs,
    !liveData,
  );
  const [activeDriverJob, setActiveDriverJob] = useStoredState<DriverJob | null>(
    "biloo.driver-active-job",
    null,
    !liveData,
  );
  const [driverEarnings, setDriverEarnings] = useStoredState(
    "biloo.driver-earnings",
    2460,
    !liveData,
  );
  const [driverCompleted, setDriverCompleted] = useStoredState(
    "biloo.driver-completed",
    14,
    !liveData,
  );
  const [storeOpen, setStoreOpen] = useStoredState(
    "biloo.store-open",
    true,
    !liveData,
  );

  const catalogItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return initialCatalog.filter((item) => {
      if (item.service !== service) return false;
      if (!normalized) return true;
      return `${item.name} ${item.merchant} ${item.category} ${item.description}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [initialCatalog, search, service]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  const upsertRealtimeOrder = useCallback(
    (incoming: ActiveOrder) => {
      setOrders((current) => {
        const exists = current.some((order) => order.id === incoming.id);
        return exists
          ? current.map((order) =>
              order.id === incoming.id ? incoming : order,
            )
          : [incoming, ...current];
      });
    },
    [setOrders],
  );

  const prependRealtimeNotification = useCallback(
    (incoming: BilooNotification) => {
      setNotifications((current) =>
        current.some((item) => item.id === incoming.id)
          ? current
          : [incoming, ...current],
      );
    },
    [setNotifications],
  );

  useBilooRealtime({
    customerId: viewer?.id,
    enabled: liveData,
    onOrder: upsertRealtimeOrder,
    onNotification: prependRealtimeNotification,
  });

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

  useEffect(() => {
    if (!selectedOrder) return;
    const latest = orders.find((order) => order.id === selectedOrder.id);
    if (latest) setSelectedOrder(latest);
  }, [orders, selectedOrder?.id]);

  useEffect(() => {
    if (liveData || !activeDriverJob) return;
    const currentJob = activeDriverJob;
    const orderId = linkedOrderIdFromJob(currentJob);
    if (!orderId) return;

    let previousStage: DriverStage | null = null;

    function syncDriverStage() {
      try {
        const stored = window.localStorage.getItem(driverStageStorageKey);
        if (!stored) return;
        const parsed = JSON.parse(stored) as {
          jobId?: string;
          stage?: DriverStage;
        };
        if (
          parsed.jobId !== currentJob.id ||
          !parsed.stage ||
          parsed.stage === previousStage
        ) {
          return;
        }

        previousStage = parsed.stage;
        const taxi = currentJob.type === "Taxi";
        const presentation: Record<
          DriverStage,
          { status: string; progress: number; eta: string }
        > = {
          accepted: {
            status: taxi
              ? "Driver accepted your ride"
              : "Driver assigned and heading to pickup",
            progress: taxi ? 28 : 66,
            eta: taxi ? "3 min" : currentJob.eta,
          },
          at_pickup: {
            status: taxi
              ? "Driver arrived at your pickup"
              : "Driver arrived at the vendor",
            progress: taxi ? 42 : 72,
            eta: taxi ? "1 min" : currentJob.eta,
          },
          picked_up: {
            status: taxi
              ? "Your ride is in progress"
              : "Driver picked up your order",
            progress: taxi ? 68 : 84,
            eta: currentJob.eta,
          },
          at_dropoff: {
            status: taxi
              ? "Driver arrived at your destination"
              : "Driver arrived at your address",
            progress: taxi ? 94 : 96,
            eta: "1 min",
          },
        };
        const next = presentation[parsed.stage];
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? { ...order, ...next } : order,
          ),
        );
      } catch {
        // The lifecycle remains usable even when storage is unavailable.
      }
    }

    syncDriverStage();
    const interval = window.setInterval(syncDriverStage, 450);
    return () => window.clearInterval(interval);
  }, [activeDriverJob, liveData, setOrders]);

  function notify(title: string, message: string) {
    const notification: BilooNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      message,
      time: "Now",
      read: false,
    };
    setNotifications((current) => [notification, ...current]);
  }

  function updateOrder(
    orderId: string,
    patch: Partial<Pick<ActiveOrder, "status" | "eta" | "progress">>,
  ) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, ...patch } : order,
      ),
    );
  }

  function addToCart(item: CatalogItem) {
    const existingService = cart[0]?.item.service;
    const existingMerchant = cart[0]?.item.merchant;
    if (existingService && existingService !== item.service) {
      setToast(
        `Your cart contains ${serviceLabel(existingService)} items. Complete or clear it before starting another order.`,
      );
      setCartOpen(true);
      return;
    }

    if (liveData && existingMerchant && existingMerchant !== item.merchant) {
      setToast(
        `Complete your ${existingMerchant} order before adding items from ${item.merchant}.`,
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

  async function confirmCheckout(paymentMethod: PaymentMethod) {
    if (!cart.length) return;

    if (liveData) {
      setToast("Placing your secure order…");
      try {
        const response = await fetch("/api/biloo/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: cart[0].item.service,
            paymentMethod,
            items: cart.map((line) => ({
              externalId: line.item.id,
              quantity: line.quantity,
            })),
          }),
        });
        const result = (await response.json()) as {
          order?: ActiveOrder;
          error?: string;
        };
        if (!response.ok || !result.order) {
          throw new Error(result.error ?? "Unable to place your order.");
        }

        upsertRealtimeOrder(result.order);
        setCart([]);
        setCheckoutOpen(false);
        setCartOpen(false);
        setToast(`Order ${result.order.id} placed successfully.`);
        setSelectedOrder(result.order);
      } catch (error) {
        setToast(error instanceof Error ? error.message : "Order failed.");
      }
      return;
    }

    const subtotal = cart.reduce(
      (total, line) => total + line.item.price * line.quantity,
      0,
    );
    const total = subtotal + 75 + Math.round(subtotal * 0.025);
    const orderService = cart[0].item.service;
    const merchant = cart[0].item.merchant;
    const lineCount = cart.reduce((totalItems, line) => totalItems + line.quantity, 0);
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
    const vendorOrder: VendorOrder = {
      id: order.id,
      customer: viewer?.displayName ?? "BILOO customer",
      total,
      items: lineCount,
      status: "New",
      placed: "Now",
    };

    setOrders((current) => [order, ...current]);
    setVendorOrders((current) => [vendorOrder, ...current]);
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    notify(
      "Order placed",
      `${order.id} was sent to ${merchant} using ${paymentMethodLabel(paymentMethod)}.`,
    );
    setToast(`Order ${order.id} entered the vendor queue.`);
    setSelectedOrder(order);
  }

  async function bookTaxi(booking: {
    pickup: string;
    dropoff: string;
    rideName: string;
    fare: number;
  }) {
    if (!booking.pickup.trim() || !booking.dropoff.trim()) {
      setToast("Enter both pickup and destination before booking.");
      return;
    }

    if (liveData) {
      setToast("Requesting your ride…");
      try {
        const rideClass = booking.rideName.toLowerCase().includes("comfort")
          ? "comfort"
          : booking.rideName.toLowerCase().includes("xl")
            ? "xl"
            : "standard";
        const response = await fetch("/api/biloo/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: "taxi",
            pickup: booking.pickup,
            dropoff: booking.dropoff,
            rideClass,
          }),
        });
        const result = (await response.json()) as {
          order?: ActiveOrder;
          error?: string;
        };
        if (!response.ok || !result.order) {
          throw new Error(result.error ?? "Unable to request your ride.");
        }
        upsertRealtimeOrder(result.order);
        setToast("Ride request sent. A driver is being matched.");
        setSelectedOrder(result.order);
      } catch (error) {
        setToast(error instanceof Error ? error.message : "Ride request failed.");
      }
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
    const driverJob: DriverJob = {
      id: linkedJobId(order.id),
      type: "Taxi",
      service: "taxi",
      pickup: booking.pickup,
      dropoff: booking.dropoff,
      amount: Math.max(220, Math.round(booking.fare * 0.72)),
      distance: "7.1 km",
      eta: "22 min",
    };

    setOrders((current) => [order, ...current]);
    setDriverJobs((current) => [driverJob, ...current]);
    notify(
      "Ride requested",
      `${order.id} is now visible to nearby BILOO drivers.`,
    );
    setToast("Ride request sent to the driver queue.");
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

    const orderId = linkedOrderIdFromJob(job);
    if (orderId) {
      updateOrder(orderId, {
        status:
          job.type === "Taxi"
            ? "Driver accepted your ride"
            : "Driver assigned and heading to pickup",
        progress: job.type === "Taxi" ? 28 : 66,
        eta: job.type === "Taxi" ? "3 min" : job.eta,
      });
      notify(
        "Driver assigned",
        `${job.id} accepted ${orderId} and is heading to pickup.`,
      );
    }

    setToast(`${job.id} accepted. Customer tracking is now connected.`);
  }

  function completeDriverJob() {
    if (!activeDriverJob) return;
    const completedJob = activeDriverJob;
    const orderId = linkedOrderIdFromJob(completedJob);

    setDriverEarnings((current) => current + completedJob.amount);
    setDriverCompleted((current) => current + 1);
    setActiveDriverJob(null);

    if (orderId) {
      updateOrder(orderId, {
        status:
          completedJob.type === "Taxi"
            ? "Ride completed"
            : "Order delivered successfully",
        progress: 100,
        eta: "Completed",
      });
      notify(
        completedJob.type === "Taxi" ? "Ride completed" : "Order delivered",
        `${orderId} completed successfully.`,
      );
    }

    setToast(`${completedJob.id} completed and all workspaces were updated.`);
  }

  function advanceVendorOrder(order: VendorOrder) {
    const currentIndex = vendorStatusOrder.indexOf(order.status);
    const nextStatus = vendorStatusOrder[currentIndex + 1] ?? order.status;
    setVendorOrders((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, status: nextStatus } : item,
      ),
    );

    const customerOrder = orders.find((item) => item.id === order.id);
    if (customerOrder) {
      const presentation: Record<
        VendorOrder["status"],
        { status: string; progress: number; eta: string }
      > = {
        New: {
          status: "Vendor is confirming your order",
          progress: 16,
          eta: customerOrder.eta,
        },
        Accepted: {
          status: "Vendor accepted your order",
          progress: 30,
          eta: customerOrder.service === "construction" ? "2–4 hrs" : "26 min",
        },
        Preparing: {
          status: "Vendor is preparing your order",
          progress: 45,
          eta: customerOrder.service === "construction" ? "2–3 hrs" : "20 min",
        },
        Ready: {
          status: "Order is ready; finding a driver",
          progress: 58,
          eta: customerOrder.service === "construction" ? "90 min" : "14 min",
        },
        Dispatched: {
          status: "Courier pickup requested",
          progress: 62,
          eta: customerOrder.service === "construction" ? "75 min" : "12 min",
        },
      };
      updateOrder(customerOrder.id, presentation[nextStatus]);

      if (nextStatus === "Ready") {
        const job: DriverJob = {
          id: linkedJobId(customerOrder.id),
          type: "Delivery",
          service: customerOrder.service,
          pickup: customerOrder.title.replace(/ order$/i, ""),
          dropoff: locationLabel,
          amount: Math.max(180, Math.round(customerOrder.total * 0.12)),
          distance: customerOrder.service === "construction" ? "13.2 km" : "6.8 km",
          eta: customerOrder.service === "construction" ? "44 min" : "24 min",
        };
        setDriverJobs((current) =>
          current.some((item) => item.id === job.id)
            ? current
            : [job, ...current],
        );
        notify(
          "Order ready",
          `${customerOrder.id} entered the driver delivery queue.`,
        );
      } else {
        notify(
          `Vendor ${nextStatus.toLowerCase()}`,
          `${customerOrder.id} moved to ${nextStatus}.`,
        );
      }
    }

    setToast(`${order.id} moved to ${nextStatus} across BILOO.`);
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
    if (liveData) {
      void fetch("/api/biloo/notifications", { method: "PATCH" });
    }
  }

  return (
    <main className="min-h-screen bg-[#f2f5f7] text-[#10243a]">
      <AppHeader
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenNotifications={openNotifications}
        unreadCount={unreadCount}
        accountInitials={viewer?.initials}
        liveData={liveData}
      />

      <div className="mx-auto grid max-w-[1540px] lg:grid-cols-[270px_minmax(0,1fr)]">
        <RoleRail
          role={role}
          setRole={setRole}
          availableRoles={viewer ? [viewer.uiRole] : undefined}
          liveData={liveData}
        />

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
            <div className="space-y-5 sm:space-y-6">
              <AdminDashboard
                incidents={incidents}
                onResolveIncident={resolveIncident}
              />
              <OperationsLifecycle
                activeDriverJob={activeDriverJob}
                driverJobs={driverJobs}
                orders={orders}
                vendorOrders={vendorOrders}
              />
            </div>
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
        onAdvance={(order: ActiveOrder) => {
          if (liveData) {
            setToast("Live order status updates automatically.");
            return;
          }
          const isConnected =
            vendorOrders.some((item) => item.id === order.id) ||
            driverJobs.some((job) => job.id === linkedJobId(order.id)) ||
            activeDriverJob?.id === linkedJobId(order.id);
          if (isConnected) {
            setToast(
              "This order is connected. Continue it from the vendor or driver workspace.",
            );
            return;
          }

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

function OperationsLifecycle({
  orders,
  vendorOrders,
  driverJobs,
  activeDriverJob,
}: {
  orders: ActiveOrder[];
  vendorOrders: VendorOrder[];
  driverJobs: DriverJob[];
  activeDriverJob: DriverJob | null;
}) {
  const recentOrders = orders.slice(0, 8);
  const linkedVendorOrders = vendorOrders.filter((item) =>
    orders.some((order) => order.id === item.id),
  ).length;
  const linkedDriverJobs = driverJobs.filter((job) =>
    Boolean(linkedOrderIdFromJob(job)),
  ).length;
  const completedOrders = orders.filter((order) => order.progress >= 100).length;

  return (
    <Surface className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            Phase 2.1 connected operations
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
            End-to-end order lifecycle
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Customer, vendor, driver and admin now share one persistent demo workflow.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
          Live demo state
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [String(orders.length), "Customer orders", "receipt" as const],
          [String(linkedVendorOrders), "Vendor-linked", "vendor" as const],
          [String(linkedDriverJobs), "Driver queue", "driver" as const],
          [String(completedOrders), "Completed", "check" as const],
        ].map(([value, label, icon]) => (
          <div className="rounded-2xl bg-[#f5f8fa] p-4" key={label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{label}</p>
              </div>
              <Icon
                className="size-5 text-[#082640]"
                name={icon as IconName}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-slate-200">
        <div className="hidden grid-cols-[0.7fr_1.2fr_0.8fr_1fr_0.65fr] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 md:grid">
          <span>Order</span>
          <span>Customer view</span>
          <span>Service</span>
          <span>Operational stage</span>
          <span>Progress</span>
        </div>
        {recentOrders.map((order) => (
          <div
            className="grid gap-3 border-t border-slate-100 px-5 py-4 first:border-t-0 md:grid-cols-[0.7fr_1.2fr_0.8fr_1fr_0.65fr] md:items-center"
            key={order.id}
          >
            <span className="text-sm font-black">{order.id}</span>
            <span>
              <span className="block text-sm font-bold text-slate-700">
                {order.status}
              </span>
              <span className="mt-1 block text-[10px] text-slate-400">
                {order.eta}
              </span>
            </span>
            <span className="text-sm font-black capitalize">
              {serviceLabel(order.service)}
            </span>
            <span className="text-xs font-black text-[#082640]">
              {orderStageLabel(order, vendorOrders, driverJobs, activeDriverJob)}
            </span>
            <span>
              <span className="block text-sm font-black">{order.progress}%</span>
              <span className="mt-2 block h-2 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(order.progress, 100)}%` }}
                />
              </span>
            </span>
          </div>
        ))}
      </div>
    </Surface>
  );
}
