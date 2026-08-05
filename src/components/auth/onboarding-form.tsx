"use client";

import { useState } from "react";

import { completeOnboardingAction } from "@/app/onboarding/actions";
import { Icon } from "@/components/biloo/ui";
import { EthiopianPhoneInput } from "@/components/forms/ethiopian-phone-input";
import { authButtonClass, authInputClass } from "./auth-shell";

type RequestedRole = "customer" | "driver" | "vendor_owner";

const roleOptions: Array<{
  value: RequestedRole;
  label: string;
  description: string;
  icon: "customer" | "driver" | "vendor";
}> = [
  {
    value: "customer",
    label: "Customer",
    description: "Book rides and order from every BILOO service immediately.",
    icon: "customer",
  },
  {
    value: "driver",
    label: "Driver",
    description: "Complete trips and deliveries after operations verification.",
    icon: "driver",
  },
  {
    value: "vendor_owner",
    label: "Vendor",
    description: "Manage products, orders and fulfilment after business review.",
    icon: "vendor",
  },
];

export function OnboardingForm({ displayName }: { displayName: string }) {
  const [requestedRole, setRequestedRole] = useState<RequestedRole>("customer");

  return (
    <form action={completeOnboardingAction} className="biloo-onboarding-form">
      <section className="biloo-onboarding-section">
        <div className="biloo-form-section-heading">
          <span>Personal details</span>
          <h2>Tell us who you are</h2>
        </div>
        <div className="biloo-form-grid two-column">
          <label className="biloo-auth-field">
            <span>Full name</span>
            <input
              autoComplete="name"
              className={authInputClass}
              defaultValue={displayName}
              name="displayName"
              required
            />
          </label>
          <label className="biloo-auth-field">
            <span>Phone number</span>
            <EthiopianPhoneInput className={authInputClass} name="phone" required />
            <small className="biloo-signup-help">
              +251 is fixed. Enter only the 9 digits starting with 9 or 7.
            </small>
          </label>
          <label className="biloo-auth-field full-width">
            <span>City</span>
            <input
              autoComplete="address-level2"
              className={authInputClass}
              defaultValue="Addis Ababa"
              name="city"
              required
            />
          </label>
        </div>
      </section>

      <fieldset className="biloo-onboarding-section">
        <div className="biloo-form-section-heading">
          <span>Workspace</span>
          <legend>Choose how you use BILOO</legend>
          <p>Customer access is immediate. Driver and vendor workspaces require verification.</p>
        </div>
        <div className="biloo-role-options">
          {roleOptions.map((option) => {
            const active = requestedRole === option.value;
            return (
              <label className="biloo-role-option" data-active={active} key={option.value}>
                <input
                  checked={active}
                  className="sr-only"
                  name="requestedRole"
                  onChange={() => setRequestedRole(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span className="biloo-role-option-icon"><Icon name={option.icon} /></span>
                <span className="biloo-role-option-copy">
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                <span className="biloo-role-option-check">
                  {active ? <Icon className="size-3" name="check" /> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {requestedRole === "driver" ? (
        <section className="biloo-verification-card" data-tone="driver">
          <div className="biloo-form-section-heading">
            <span>Driver verification</span>
            <h2>Tell operations what you drive</h2>
            <p>Your workspace activates after the submitted details are reviewed.</p>
          </div>
          <div className="biloo-form-grid two-column">
            <label className="biloo-auth-field">
              <span>Vehicle type</span>
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
            <label className="biloo-auth-field">
              <span>Plate number</span>
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
        <section className="biloo-verification-card" data-tone="vendor">
          <div className="biloo-form-section-heading">
            <span>Vendor verification</span>
            <h2>Create your business identity</h2>
            <p>These details are reviewed before the vendor workspace becomes operational.</p>
          </div>
          <div className="biloo-form-grid two-column">
            <label className="biloo-auth-field">
              <span>Registered business name</span>
              <input
                autoComplete="organization"
                className={authInputClass}
                name="legalName"
                placeholder="Legal or licensed name"
                required
              />
            </label>
            <label className="biloo-auth-field">
              <span>Storefront name</span>
              <input
                className={authInputClass}
                name="businessDisplayName"
                placeholder="Name customers will see"
                required
              />
            </label>
            <label className="biloo-auth-field full-width">
              <span>Primary service</span>
              <select className={authInputClass} name="vendorServiceType" required>
                <option value="">Select service</option>
                <option value="food">Food delivery</option>
                <option value="market">Supermarket</option>
                <option value="construction">Construction materials</option>
                <option value="parts">Car parts</option>
              </select>
            </label>
          </div>
        </section>
      ) : null}

      <div className="biloo-form-disclosure">
        <Icon className="size-[17px]" name="shield" />
        <p>
          By continuing, you confirm that the submitted information is accurate. Approved driver and vendor applications create an operational profile automatically.
        </p>
      </div>

      <button className={authButtonClass} type="submit">
        {requestedRole === "customer" ? "Activate customer account" : "Submit for verification"}
      </button>
    </form>
  );
}
