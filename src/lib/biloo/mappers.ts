import type { ActiveOrder, BilooNotification } from "@/data/biloo";
import type { BilooOrderStatus, NotificationRow, OrderRow } from "@/types/database";

const statusPresentation: Record<
  BilooOrderStatus,
  { label: string; progress: number }
> = {
  payment_pending: { label: "Payment is being confirmed", progress: 8 },
  confirmed: { label: "Vendor is confirming your order", progress: 16 },
  vendor_accepted: { label: "Vendor accepted your order", progress: 28 },
  preparing: { label: "Your order is being prepared", progress: 42 },
  ready_for_pickup: { label: "Order is ready for pickup", progress: 56 },
  driver_assigned: { label: "A driver has been assigned", progress: 64 },
  picked_up: { label: "Driver collected your order", progress: 72 },
  in_transit: { label: "Your order is on the way", progress: 84 },
  delivered: { label: "Delivered", progress: 100 },
  cancelled_by_customer: { label: "Cancelled by customer", progress: 0 },
  cancelled_by_vendor: { label: "Cancelled by vendor", progress: 0 },
  cancelled_by_driver: { label: "Cancelled by driver", progress: 0 },
  failed: { label: "Order failed", progress: 0 },
  refunded: { label: "Order refunded", progress: 0 },
};

function relativeDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function mapOrderRow(order: OrderRow): ActiveOrder {
  const presentation = statusPresentation[order.status];
  return {
    id: order.public_id,
    service: order.service_type,
    title: order.title,
    status: presentation.label,
    eta: order.status === "delivered" ? "Complete" : `${order.eta_minutes ?? 28} min`,
    progress: presentation.progress,
    total: Math.round(order.total_minor / 100),
    createdAt: relativeDate(order.created_at),
  };
}

export function mapNotificationRow(
  notification: NotificationRow,
): BilooNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: relativeDate(notification.created_at),
    read: Boolean(notification.read_at),
  };
}
