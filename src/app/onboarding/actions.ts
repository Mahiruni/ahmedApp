"use server";

import { redirect } from "next/navigation";

import { normalizeEthiopianPhone } from "@/lib/biloo/phone";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function completeOnboardingAction(formData: FormData) {
  const displayName = value(formData, "displayName");
  const phone = normalizeEthiopianPhone(value(formData, "phone"));
  const city = value(formData, "city") || "Addis Ababa";
  const requestedRole = value(formData, "requestedRole");

  if (displayName.length < 2 || !phone) {
    redirect(
      "/onboarding?error=Enter%20your%20name%20and%20the%209%20mobile%20digits%20after%20%2B251.",
    );
  }

  if (
    requestedRole !== "customer" &&
    requestedRole !== "driver" &&
    requestedRole !== "vendor_owner"
  ) {
    redirect("/onboarding?error=Choose%20a%20valid%20BILOO%20workspace.");
  }

  let applicationData: Json = {};

  if (requestedRole === "driver") {
    const vehicleType = value(formData, "vehicleType");
    const plateNumber = value(formData, "plateNumber").toUpperCase();

    if (!vehicleType || plateNumber.length < 3) {
      redirect(
        "/onboarding?error=Driver%20applications%20require%20a%20vehicle%20type%20and%20plate%20number.",
      );
    }

    applicationData = {
      vehicle_type: vehicleType,
      plate_number: plateNumber,
    };
  }

  if (requestedRole === "vendor_owner") {
    const legalName = value(formData, "legalName");
    const businessDisplayName = value(formData, "businessDisplayName");
    const serviceType = value(formData, "vendorServiceType");

    if (
      legalName.length < 2 ||
      businessDisplayName.length < 2 ||
      !["food", "market", "construction", "parts"].includes(serviceType)
    ) {
      redirect(
        "/onboarding?error=Vendor%20applications%20require%20complete%20business%20details%20and%20a%20valid%20service.",
      );
    }

    applicationData = {
      legal_name: legalName,
      display_name: businessDisplayName,
      service_type: serviceType,
    };
  }

  const supabase = await createClient();
  const phoneVerificationEnabled =
    process.env.NEXT_PUBLIC_BILOO_PHONE_VERIFICATION_ENABLED === "true";

  if (phoneVerificationEnabled) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const authenticatedPhone = normalizeEthiopianPhone(user?.phone ?? "");

    if (userError || !user) {
      redirect("/auth/login?error=Sign%20in%20again%20before%20continuing.");
    }

    if (authenticatedPhone !== phone || !user.phone_confirmed_at) {
      redirect(
        "/onboarding?error=Verify%20this%20phone%20number%20before%20completing%20onboarding.",
      );
    }
  }

  const { error } = await supabase.rpc("complete_biloo_onboarding", {
    p_display_name: displayName,
    p_phone: phone,
    p_city: city,
    p_requested_role: requestedRole,
    p_application_data: applicationData,
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/biloo");
}
