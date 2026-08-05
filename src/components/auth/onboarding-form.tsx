"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { completeOnboardingAction } from "@/app/onboarding/actions";
import { Icon } from "@/components/biloo/ui";
import { EthiopianPhoneInput } from "@/components/forms/ethiopian-phone-input";
import { normalizeEthiopianPhone } from "@/lib/biloo/phone";
import { createClient } from "@/lib/supabase/client";
import { authButtonClass, authInputClass } from "./auth-shell";

type RequestedRole = "customer" | "driver" | "vendor_owner";
type OtpStage = "idle" | "sending" | "code" | "verifying" | "verified";
type OtpMessage = { tone: "error" | "success" | "info"; text: string } | null;

type OnboardingFormProps = {
  defaultPhone?: string;
  displayName: string;
  initialPhoneVerified?: boolean;
  phoneVerificationEnabled?: boolean;
};

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

function phoneOtpError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
    return "Please wait before requesting another verification code.";
  }

  if (
    normalized.includes("sms provider") ||
    normalized.includes("phone provider") ||
    normalized.includes("unsupported phone")
  ) {
    return "SMS verification is not active yet. BILOO must finish its SMS provider setup before codes can be delivered.";
  }

  if (normalized.includes("already") && normalized.includes("registered")) {
    return "That phone number is already connected to another BILOO account.";
  }

  if (normalized.includes("expired") || normalized.includes("invalid")) {
    return "That verification code is invalid or has expired. Request a new code and try again.";
  }

  return message;
}

export function OnboardingForm({
  defaultPhone = "",
  displayName,
  initialPhoneVerified = false,
  phoneVerificationEnabled = false,
}: OnboardingFormProps) {
  const normalizedDefaultPhone = normalizeEthiopianPhone(defaultPhone) ?? "";
  const [requestedRole, setRequestedRole] = useState<RequestedRole>("customer");
  const [phone, setPhone] = useState(normalizedDefaultPhone);
  const [verifiedPhone, setVerifiedPhone] = useState(
    initialPhoneVerified ? normalizedDefaultPhone : "",
  );
  const [sentPhone, setSentPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStage, setOtpStage] = useState<OtpStage>(
    initialPhoneVerified ? "verified" : "idle",
  );
  const [otpMessage, setOtpMessage] = useState<OtpMessage>(
    initialPhoneVerified
      ? { tone: "success", text: "This phone number is already verified." }
      : null,
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const phoneVerified = Boolean(phone && phone === verifiedPhone);
  const otpBusy = otpStage === "sending" || otpStage === "verifying";

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  function handlePhoneChange(nextPhone: string) {
    setPhone(nextPhone);

    if (nextPhone !== verifiedPhone) {
      setSentPhone("");
      setOtp("");
      setOtpStage("idle");
      setOtpMessage(null);
      setCooldownSeconds(0);
    }
  }

  async function requestPhoneOtp() {
    if (!phone) {
      setOtpMessage({
        tone: "error",
        text: "Enter the 9 mobile digits after +251 before requesting a code.",
      });
      return;
    }

    setOtpStage("sending");
    setOtpMessage({ tone: "info", text: "Sending your verification code…" });

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ phone });

    if (error) {
      setOtpStage("idle");
      setOtpMessage({ tone: "error", text: phoneOtpError(error.message) });
      return;
    }

    setSentPhone(phone);
    setOtp("");
    setOtpStage("code");
    setCooldownSeconds(60);
    setOtpMessage({
      tone: "success",
      text: `A 6-digit code was sent to ${phone}.`,
    });
  }

  async function resendPhoneOtp() {
    if (!sentPhone || cooldownSeconds > 0) return;

    setOtpStage("sending");
    setOtpMessage({ tone: "info", text: "Sending a new verification code…" });

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      phone: sentPhone,
      type: "phone_change",
    });

    if (error) {
      setOtpStage("code");
      setOtpMessage({ tone: "error", text: phoneOtpError(error.message) });
      return;
    }

    setOtp("");
    setOtpStage("code");
    setCooldownSeconds(60);
    setOtpMessage({ tone: "success", text: "A new verification code was sent." });
  }

  async function verifyPhoneOtp() {
    if (!sentPhone || otp.length !== 6) {
      setOtpMessage({ tone: "error", text: "Enter the complete 6-digit code." });
      return;
    }

    setOtpStage("verifying");
    setOtpMessage({ tone: "info", text: "Verifying your phone number…" });

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: sentPhone,
      token: otp,
      type: "phone_change",
    });

    if (error) {
      setOtpStage("code");
      setOtpMessage({ tone: "error", text: phoneOtpError(error.message) });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const authenticatedPhone = normalizeEthiopianPhone(user?.phone ?? "");

    if (userError || authenticatedPhone !== sentPhone || !user?.phone_confirmed_at) {
      setOtpStage("code");
      setOtpMessage({
        tone: "error",
        text: "The code was accepted, but BILOO could not confirm the updated phone. Please try once more.",
      });
      return;
    }

    setVerifiedPhone(sentPhone);
    setOtpStage("verified");
    setOtpMessage({ tone: "success", text: "Phone number verified successfully." });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (phoneVerificationEnabled && !phoneVerified) {
      event.preventDefault();
      setOtpMessage({
        tone: "error",
        text: "Verify your phone number before completing onboarding.",
      });
    }
  }

  return (
    <form
      action={completeOnboardingAction}
      className="biloo-onboarding-form"
      onSubmit={handleSubmit}
    >
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
          <div className="biloo-auth-field">
            <span>Phone number</span>
            <EthiopianPhoneInput
              className={authInputClass}
              defaultValue={normalizedDefaultPhone}
              describedBy="biloo-phone-help biloo-phone-otp-message"
              name="phone"
              onValueChange={handlePhoneChange}
              readOnly={otpBusy}
              required
            />
            <small className="biloo-signup-help" id="biloo-phone-help">
              +251 is fixed. Enter only the 9 digits starting with 9 or 7.
            </small>

            {phoneVerificationEnabled ? (
              <div
                className="biloo-phone-verification"
                data-state={phoneVerified ? "verified" : otpStage}
              >
                <div className="biloo-phone-verification-heading">
                  <span aria-hidden="true" className="biloo-phone-verification-icon">
                    {phoneVerified ? "✓" : "6"}
                  </span>
                  <div>
                    <strong>
                      {phoneVerified ? "Phone verified" : "Verify with a 6-digit code"}
                    </strong>
                    <small>
                      {phoneVerified
                        ? "This number is securely connected to your BILOO account."
                        : "BILOO sends the code by SMS before account activation."}
                    </small>
                  </div>
                </div>

                {!phoneVerified && otpStage === "idle" ? (
                  <button
                    className="biloo-phone-otp-secondary"
                    disabled={!phone}
                    onClick={requestPhoneOtp}
                    type="button"
                  >
                    Send verification code
                  </button>
                ) : null}

                {!phoneVerified && (otpStage === "code" || otpStage === "verifying") ? (
                  <div className="biloo-phone-otp-entry">
                    <label htmlFor="biloo-phone-otp">
                      <span>Verification code</span>
                      <input
                        autoComplete="one-time-code"
                        className={authInputClass}
                        id="biloo-phone-otp"
                        inputMode="numeric"
                        maxLength={6}
                        onChange={(event) =>
                          setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        pattern="[0-9]{6}"
                        placeholder="000000"
                        type="text"
                        value={otp}
                      />
                    </label>
                    <div className="biloo-phone-otp-actions">
                      <button
                        className="biloo-phone-otp-primary"
                        disabled={otp.length !== 6 || otpStage === "verifying"}
                        onClick={verifyPhoneOtp}
                        type="button"
                      >
                        {otpStage === "verifying" ? "Verifying…" : "Verify phone"}
                      </button>
                      <button
                        className="biloo-phone-otp-link"
                        disabled={cooldownSeconds > 0 || otpStage === "verifying"}
                        onClick={resendPhoneOtp}
                        type="button"
                      >
                        {cooldownSeconds > 0
                          ? `Resend in ${cooldownSeconds}s`
                          : "Resend code"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {!phoneVerified && otpStage === "sending" ? (
                  <div className="biloo-phone-otp-loading" role="status">
                    <span aria-hidden="true" />
                    Sending code…
                  </div>
                ) : null}

                {otpMessage ? (
                  <p
                    aria-live="polite"
                    className="biloo-phone-otp-message"
                    data-tone={otpMessage.tone}
                    id="biloo-phone-otp-message"
                  >
                    {otpMessage.text}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
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

      <button
        className={authButtonClass}
        disabled={phoneVerificationEnabled && !phoneVerified}
        type="submit"
      >
        {phoneVerificationEnabled && !phoneVerified
          ? "Verify phone to continue"
          : requestedRole === "customer"
            ? "Activate customer account"
            : "Submit for verification"}
      </button>
    </form>
  );
}
