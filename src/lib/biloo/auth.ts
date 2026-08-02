import { redirect } from "next/navigation";

import type { Role } from "@/data/biloo";
import type { BilooUserRole, ProfileRow } from "@/types/database";

import { createClient } from "@/lib/supabase/server";

export interface AppViewer {
  id: string;
  email: string | null;
  displayName: string;
  initials: string;
  databaseRole: BilooUserRole;
  uiRole: Role;
  onboardingComplete: boolean;
}

function toUiRole(role: BilooUserRole): Role {
  if (role === "driver") return "driver";
  if (role === "vendor_owner" || role === "vendor_staff") return "vendor";
  if (role === "admin" || role === "support" || role === "finance") {
    return "admin";
  }
  return "customer";
}

function initials(name: string, email: string | null) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length) {
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return (email?.slice(0, 2) || "BI").toUpperCase();
}

export async function getViewer(): Promise<AppViewer | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) return null;

  const { data: profile, error: profileError } = await supabase
    .from("biloo_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) return null;
  const typedProfile = profile as ProfileRow;

  const email =
    typedProfile.email ??
    (claimsData.claims.email as string | undefined) ??
    null;
  const displayName = typedProfile.display_name || email || "BILOO member";

  return {
    id: userId,
    email,
    displayName,
    initials: initials(displayName, email),
    databaseRole: typedProfile.role,
    uiRole: toUiRole(typedProfile.role),
    onboardingComplete: Boolean(typedProfile.onboarding_completed_at),
  };
}

export async function requireViewer(options?: { onboarding?: boolean }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth/login");
  if (options?.onboarding !== false && !viewer.onboardingComplete) {
    redirect("/onboarding");
  }
  return viewer;
}
