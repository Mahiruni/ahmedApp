import { redirect } from "next/navigation";

import { AuthError, AuthShell } from "@/components/auth/auth-shell";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getViewer } from "@/lib/biloo/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth/login");
  if (viewer.onboardingComplete) redirect("/biloo");
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Phase 2.2 account activation"
      title="Choose how you operate in BILOO"
      description="Create a customer account instantly or submit complete driver and vendor details for secure operations review."
    >
      <AuthError message={params.error} />
      <OnboardingForm displayName={viewer.displayName} />
    </AuthShell>
  );
}
