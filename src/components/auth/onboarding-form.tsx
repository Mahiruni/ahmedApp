"use client";

import { useState } from "react";

import { completeOnboardingAction } from "@/app/onboarding/actions";
import { authButtonClass, authInputClass } from "./auth-shell";

type RequestedRole = "customer" | "driver" | "vendor_owner";

const roleOptions: Array<{
  value: RequestedRole;
  label: string;
  description: string;
  number: string;
}> = [
  {
    value: "customer",
    label: "Customer",
    description: "Order products and book rides immediately.",
    number: "01",
  },
  {
    value: "driver",
    label: "Driver",
    description: "Complete trips and deliveries after verification.",
    number: "02",
  },
  {
    value: "vendor_owner",
    label: "Vendor",
    description: "Sell and fulfil orders after business verification.",
    number: "03",
  },
];

export function OnboardingForm({ displayName }: { displayName: string }) {
  const [requestedRole, setRequestedRole] = useState<RequestedRole>("customer");

  return (
    <form action={completeOnboardingAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-black text-[#10243a]">
          Full name
          <input
            autoComplete="name"
            className={authInputClass}
            defaultValue={displayName}
            name="displayName"
            required
          />
        </label>
        <label className="block text-sm font-black text-[#10243a]">
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
      </div>

      <label className="block text-sm font-black text-[#10243a]">
        City
        <input
          autoComplete="address-level2"
          className={authInputClass}
          defaultValue="Addis Ababa"
          name="city"
          required
        />
      </label>

      <fieldset>
        <legend className="text-sm font-black text-[#10243a]">
          Choose your BILOO workspace
        </legend>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Customer access is immediate. Driver and vendor workspaces require an admin review.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {roleOptions.map((option) => {
            const active = requestedRole === option.value;
            return (
              <label
                className={`relative cursor-pointer overflow-hidden rounded-[1.4rem] border p-4 transition ${
                  active
                    ? "border-[#0a1b31] bg-[#0a1b31] text-white shadow-[0_18px_45px_rgba(7,17,31,0.16)]"
                    : "border-slate-200 bg-white text-[#10243a] hover:border-slate-300"
                }`}
                key={option.value}
              >
                <input
                  checked={active}
                  className="sr-only"
                  name="requestedRole"
                  onChange={() => setRequestedRole(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span
                  className={`absolute right-3 top-3 text-[10px] font-black ${
                    active ? "text-white/25" : "text-slate-300"
                  }`}
                >
                  {option.number}
                </span>
                <span className="block text-sm font-black">{option.label}</span>
                <span
                  className={`mt-2 block text-xs leading-5 ${
                    active ? "text-white/50" : "text-slate-400"
                  }`}
                >
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {requestedRole === "driver" ? (
        <section className="rounded-[1.45rem] border border-emerald-100 bg-emerald-50/70 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            Driver verification
          </p>
          <h2 className="mt-2 text-lg font-black tracking-[-0.03em] text-[#10243a]">
            Tell operations what you drive.
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-black text-[#10243a]">
              Vehicle type
              <select className={authInputClass} name="vehicleType" required>
                <option value="">Select vehicle</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Bajaj">Bajaj</option>
                <option value="Sedan">Sedan</option>
                <option value="Van">Van</option>
                <option value="Pickup truck">Pickup truck</option>
                <option value="Heavy truck">Heavy truck</option>
              </select>
            </label>
            <label className="block text-sm font-black text-[#10243a]">
              Plate number
              <input
                autoComplete="off"
                className={authInputClass}
                name="plateNumber"
                placeholder="Example: 2-A12345"
                required
              />
            </label>
          </div>
        </section>
      ) : null}

      {requestedRole === "vendor_owner" ? (
        <section className="rounded-[1.45rem] border border-amber-100 bg-amber-50/70 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
            Vendor verification
          </p>
          <h2 className="mt-2 text-lg font-black tracking-[-0.03em] text-[#10243a]">
            Create the business identity operations will review.
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-black text-[#10243a]">
              Registered business name
              <input
                autoComplete="organization"
                className={authInputClass}
                name="legalName"
                placeholder="Legal or licensed name"
                required
              />
            </label>
            <label className="block text-sm font-black text-[#10243a]">
              Storefront name
              <input
                className={authInputClass}
                name="businessDisplayName"
                placeholder="Name customers will see"
                required
              />
            </label>
          </div>
          <label className="mt-4 block text-sm font-black text-[#10243a]">
            Primary service
            <select className={authInputClass} name="vendorServiceType" required>
              <option value="">Select service</option>
              <option value="food">Food delivery</option>
              <option value="market">Supermarket</option>
              <option value="construction">Construction materials</option>
              <option value="parts">Car parts</option>
            </select>
          </label>
        </section>
      ) : null}

      <div className="rounded-2xl bg-[#f3f6f9] px-4 py-3 text-xs leading-5 text-slate-500">
        By continuing, you confirm that the submitted information is accurate. Approved driver and vendor applications create an operational profile automatically.
      </div>

      <button className={authButtonClass} type="submit">
        {requestedRole === "customer" ? "Activate customer account" : "Submit for verification"}
      </button>
    </form>
  );
}
