import { redirect } from "next/navigation";

import { BilooApp } from "@/components/biloo/biloo-app";
import { getViewer } from "@/lib/biloo/auth";
import { getCatalog, getCustomerOrders, getNotifications } from "@/lib/biloo/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function BilooPage() {
  if (!isSupabaseConfigured()) return <BilooApp />;

  const viewer = await getViewer();
  if (!viewer) redirect("/auth/login?next=/biloo");
  if (!viewer.onboardingComplete) redirect("/onboarding");

  const [catalog, orders, notifications] = await Promise.all([
    getCatalog(),
    getCustomerOrders(viewer.id),
    getNotifications(viewer.id),
  ]);

  return (
    <BilooApp
      initialCatalog={catalog}
      initialRemoteNotifications={notifications}
      initialRemoteOrders={orders}
      liveData
      viewer={viewer}
    />
  );
}
