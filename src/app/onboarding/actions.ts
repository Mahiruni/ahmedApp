"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function completeOnboardingAction(formData: FormData) {
  const displayName = value(formData, "displayName");
  const phone = value(formData, "phone");
  const city = value(formData, "city") || "Addis Ababa";
  const requestedRole = value(formData, "requestedRole");

  if (displayName.length < 2 || phone.length < 7) {
    redirect(
      "/onboarding?error=Enter%20your%20name%20and%20a%20valid%20phone%20number.",
    );
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/auth/login");

  const { error: profileError } = await supabase
    .from("biloo_profiles")
    .update({
      display_name: displayName,
      phone,
      city,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    redirect(`/onboarding?error=${encodeURIComponent(profileError.message)}`);
  }

  if (requestedRole === "driver" || requestedRole === "vendor_owner") {
    const { error: applicationError } = await supabase
      .from("biloo_role_applications")
      .insert({
        user_id: userId,
        requested_role: requestedRole,
        status: "pending",
      });

    if (applicationError && applicationError.code !== "23505") {
      redirect(`/onboarding?error=${encodeURIComponent(applicationError.message)}`);
    }
  }

  redirect("/biloo");
}
