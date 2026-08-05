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
      eyebrow="COMPLETE YOUR ACCOUNT"
      title="Choose how you use BILOO"
      description="Activate customer access immediately or submit driver and vendor details for secure operations verification."
      wide
    >
      <AuthError message={params.error} />
      <OnboardingForm displayName={viewer.displayName} />
    </AuthShell>
  );
}
