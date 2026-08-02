import type { ActiveOrder, BilooNotification, CatalogItem } from "@/data/biloo";
import type { NotificationRow, OrderRow } from "@/types/database";

import { createClient } from "@/lib/supabase/server";

import { mapNotificationRow, mapOrderRow } from "./mappers";

export async function getCustomerOrders(
  customerId: string,
): Promise<ActiveOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biloo_orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(`Unable to load orders: ${error.message}`);
  return ((data ?? []) as OrderRow[]).map(mapOrderRow);
}

export async function getNotifications(
  recipientId: string,
): Promise<BilooNotification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biloo_notifications")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(`Unable to load notifications: ${error.message}`);
  return ((data ?? []) as NotificationRow[]).map(mapNotificationRow);
}


interface CatalogProductRecord {
  external_id: string;
  service_type: Exclude<CatalogItem["service"], "taxi">;
  name: string;
  description: string | null;
  category: string | null;
  unit_price_minor: number;
  rating: number | null;
  eta_label: string | null;
  badge: string | null;
  icon: string | null;
  stock_quantity: number | null;
  biloo_vendors: { display_name: string } | Array<{ display_name: string }>;
}

export async function getCatalog(): Promise<CatalogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biloo_products")
    .select(
      "external_id, service_type, name, description, category, unit_price_minor, rating, eta_label, badge, icon, stock_quantity, biloo_vendors!inner(display_name)",
    )
    .eq("is_active", true)
    .order("service_type")
    .order("name");

  if (error) throw new Error(`Unable to load catalog: ${error.message}`);

  return ((data ?? []) as unknown as CatalogProductRecord[]).map((product) => {
    const vendor = Array.isArray(product.biloo_vendors)
      ? product.biloo_vendors[0]
      : product.biloo_vendors;

    return {
      id: product.external_id,
      service: product.service_type,
      merchant: vendor?.display_name ?? "BILOO vendor",
      name: product.name,
      description: product.description ?? "",
      category: product.category ?? "General",
      price: Math.round(product.unit_price_minor / 100),
      rating: product.rating ?? 4.5,
      eta: product.eta_label ?? "30–45 min",
      badge: product.badge ?? undefined,
      icon: product.icon ?? "📦",
      stock: product.stock_quantity ?? undefined,
    };
  });
}
