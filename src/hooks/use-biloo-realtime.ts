"use client";

import { useEffect } from "react";

import type { ActiveOrder, BilooNotification } from "@/data/biloo";
import type { NotificationRow, OrderRow } from "@/types/database";

import { mapNotificationRow, mapOrderRow } from "@/lib/biloo/mappers";
import { createClient } from "@/lib/supabase/client";

export function useBilooRealtime({
  customerId,
  enabled,
  onOrder,
  onNotification,
}: {
  customerId?: string;
  enabled: boolean;
  onOrder: (order: ActiveOrder) => void;
  onNotification: (notification: BilooNotification) => void;
}) {
  useEffect(() => {
    if (!enabled || !customerId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`biloo-customer-${customerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "biloo_orders",
          filter: `customer_id=eq.${customerId}`,
        },
        (payload: { new: unknown }) => {
          const row = payload.new as OrderRow;
          if (row?.id) onOrder(mapOrderRow(row));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "biloo_notifications",
          filter: `recipient_id=eq.${customerId}`,
        },
        (payload: { new: unknown }) => {
          const row = payload.new as NotificationRow;
          if (row?.id) onNotification(mapNotificationRow(row));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [customerId, enabled, onNotification, onOrder]);
}
