import { redirect } from "next/navigation";

import {
  AuthError,
  AuthShell,
  authButtonClass,
  authInputClass,
} from "@/components/auth/auth-shell";
import { getViewer } from "@/lib/biloo/auth";
import { completeOnboardingAction } from "./actions";

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
      eyebrow="Account setup"
      title="Complete your BILOO profile"
      description="Tell us how you plan to use BILOO. Driver and vendor access require admin verification."
    >
      <AuthError message={params.error} />
      <form action={completeOnboardingAction}>
        <label className="block text-sm font-black text-[#10243a]">
          Full name
          <input
            autoComplete="name"
            className={authInputClass}
            defaultValue={viewer.displayName}
            name="displayName"
            required
          />
        </label>
        <label className="mt-5 block text-sm font-black text-[#10243a]">
          Phone number
          <input
            autoComplete="tel"
            className={authInputClass}
            name="phone"
            placeholder="+251 9..."
            required
            type="tel"
          />
        </label>
        <label className="mt-5 block text-sm font-black text-[#10243a]">
          City
          <input
            autoComplete="address-level2"
            className={authInputClass}
            defaultValue="Addis Ababa"
            name="city"
            required
          />
        </label>
        <fieldset className="mt-6">
          <legend className="text-sm font-black text-[#10243a]">
            How will you use BILOO?
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["customer", "Customer", "Order and book"],
              ["driver", "Driver", "Trips and delivery"],
              ["vendor_owner", "Vendor", "Sell and fulfil"],
            ].map(([value, label, description], index) => (
              <label
                className="cursor-pointer rounded-2xl border border-slate-200 p-4 transition has-[:checked]:border-[#d99a1f] has-[:checked]:bg-amber-50"
                key={value}
              >
                <input
                  className="sr-only"
                  defaultChecked={index === 0}
                  name="requestedRole"
                  type="radio"
                  value={value}
                />
                <span className="block text-sm font-black text-[#082640]">
                  {label}
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-400">
                  {description}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className={authButtonClass} type="submit">
          Finish account setup
        </button>
      </form>
    </AuthShell>
  );
}
