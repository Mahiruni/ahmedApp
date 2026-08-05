import { redirect } from "next/navigation";

import { AuthError, AuthShell } from "@/components/auth/auth-shell";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getViewer } from "@/lib/biloo/auth";
import { normalizeEthiopianPhone } from "@/lib/biloo/phone";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth/login");
  if (viewer.onboardingComplete) redirect("/biloo");

  const phoneVerificationEnabled =
    process.env.NEXT_PUBLIC_BILOO_PHONE_VERIFICATION_ENABLED === "true";
  let defaultPhone = viewer.phone ?? "";
  let initialPhoneVerified = false;

  if (phoneVerificationEnabled) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const authenticatedPhone = normalizeEthiopianPhone(user?.phone ?? "");

    if (authenticatedPhone) defaultPhone = authenticatedPhone;
    initialPhoneVerified = Boolean(authenticatedPhone && user?.phone_confirmed_at);
  }

  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Secure account activation"
      title="Choose how you operate in BILOO"
      description="Verify your contact details, create a customer account or submit complete driver and vendor information for secure operations review."
    >
      <AuthError message={params.error} />
      <OnboardingForm
        defaultPhone={defaultPhone}
        displayName={viewer.displayName}
        initialPhoneVerified={initialPhoneVerified}
        phoneVerificationEnabled={phoneVerificationEnabled}
      />
    </AuthShell>
  );
}
