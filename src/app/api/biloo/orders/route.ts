import { NextResponse } from "next/server";

import type { Json, OrderRow } from "@/types/database";

import { mapOrderRow } from "@/lib/biloo/mappers";
import { createClient } from "@/lib/supabase/server";

interface CheckoutBody {
  service: "food" | "taxi" | "market" | "construction" | "parts";
  paymentMethod?: "wallet" | "card" | "cash";
  deliveryAddressId?: string | null;
  items?: Array<{ externalId: string; quantity: number }>;
  pickup?: string;
  dropoff?: string;
  rideClass?: string;
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) return badRequest("Authentication required.", 401);

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return badRequest("Invalid request body.");
  }

  let orderId: string | null = null;

  if (body.service === "taxi") {
    if (!body.pickup?.trim() || !body.dropoff?.trim() || !body.rideClass) {
      return badRequest("Pickup, destination and ride class are required.");
    }

    const { data, error } = await supabase.rpc("request_biloo_ride", {
      p_pickup: body.pickup.trim(),
      p_dropoff: body.dropoff.trim(),
      p_ride_class: body.rideClass,
    });
    if (error) return badRequest(error.message);
    orderId = data;
  } else {
    const items = (body.items ?? []).filter(
      (item) =>
        item.externalId &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99,
    );
    if (!items.length) return badRequest("Your cart is empty.");

    const { data, error } = await supabase.rpc("place_biloo_order", {
      p_items: items.map((item) => ({
        external_id: item.externalId,
        quantity: item.quantity,
      })) as Json,
      p_payment_method: body.paymentMethod ?? "cash",
      p_delivery_address_id: body.deliveryAddressId ?? null,
    });
    if (error) return badRequest(error.message);
    orderId = data;
  }

  if (!orderId) return badRequest("Order creation did not return an ID.", 500);

  const { data: order, error: orderError } = await supabase
    .from("biloo_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return badRequest(orderError?.message ?? "Unable to load the new order.", 500);
  }

  return NextResponse.json(
    { order: mapOrderRow(order as OrderRow) },
    { status: 201 },
  );
}
