"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { signUpAction } from "@/app/auth/actions";
import { Icon } from "@/components/biloo/ui";
import { EthiopianPhoneInput } from "@/components/forms/ethiopian-phone-input";

import { authButtonClass, authInputClass } from "./auth-shell";

const ethiopianRegions = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Central Ethiopia",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South Ethiopia",
  "South West Ethiopia Peoples’ Region",
  "Tigray",
];

const signupSteps = [
  { label: "Personal", description: "Your Ethiopian name" },
  { label: "Account", description: "Contact and username" },
  { label: "Location", description: "Region and city" },
  { label: "Security", description: "Password and review" },
] as const;

const finalStep = signupSteps.length - 1;

type SignupValues = {
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  username: string;
  phone: string;
  email: string;
  region: string;
  city: string;
  subCity: string;
  woreda: string;
};

const initialValues: SignupValues = {
  firstName: "",
  fatherName: "",
  grandfatherName: "",
  username: "",
  phone: "",
  email: "",
  region: "",
  city: "",
  subCity: "",
  woreda: "",
};

function FieldLabel({
  children,
  optional = false,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <span className="mb-2 flex items-center justify-between gap-3 text-[12px] font-semibold text-[#252238]">
      <span>{children}</span>
      {optional ? (
        <span className="text-[10px] font-medium text-[#8a8798]">Optional</span>
      ) : null}
    </span>
  );
}

function SubmitButton({ passwordReady }: { passwordReady: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={`${authButtonClass} biloo-signup-submit`}
      disabled={pending || !passwordReady}
      type="submit"
    >
      {pending ? (
        <>
          <span className="biloo-feedback-spinner" aria-hidden="true" />
          <span>Submitting your registration…</span>
        </>
      ) : (
        <>
          <Icon className="size-[17px]" name="shield" />
          <span>Create customer account</span>
          <Icon className="size-[16px]" name="arrow" />
        </>
      )}
    </button>
  );
}

export function SignUpForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<SignupValues>(initialValues);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const usernameValid = /^[a-z][a-z0-9._]{2,29}$/.test(values.username);
  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password),
      match: password.length > 0 && password === confirmPassword,
    }),
    [confirmPassword, password],
  );
  const passwordReady =
    passwordChecks.length &&
    passwordChecks.letter &&
    passwordChecks.number &&
    passwordChecks.match;

  function updateField<Key extends keyof SignupValues>(
    key: Key,
    value: SignupValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateUsername(value: string) {
    updateField(
      "username",
      value
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9._]/g, "")
        .slice(0, 30),
    );
  }

  function validateCurrentStep() {
    const panel = formRef.current?.querySelector<HTMLElement>(
      `[data-signup-panel="${step}"]`,
    );
    const controls = panel?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input:not([type='hidden']), select, textarea");

    for (const control of Array.from(controls ?? [])) {
      if (!control.checkValidity()) {
        control.reportValidity();
        control.focus();
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, finalStep));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goPrevious() {
    setStep((current) => Math.max(current - 1, 0));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (step !== finalStep) {
      event.preventDefault();
      goNext();
    }
  }

  return (
    <form
      action={signUpAction}
      className="biloo-signup-form"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div className="biloo-signup-progress" aria-label={`Step ${step + 1} of ${signupSteps.length}`}>
        <div className="biloo-signup-progress-track" aria-hidden="true">
          <span style={{ width: `${(step / finalStep) * 100}%` }} />
        </div>
        <ol>
          {signupSteps.map((item, index) => {
            const state = index < step ? "complete" : index === step ? "current" : "upcoming";
            return (
              <li data-state={state} key={item.label}>
                <span>{index < step ? "✓" : index + 1}</span>
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <section
        className="biloo-signup-section biloo-signup-panel"
        data-signup-panel="0"
        hidden={step !== 0}
      >
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">1</span>
          <div>
            <h2>Personal information</h2>
            <p>Enter your name as you normally use it in Ethiopia.</p>
          </div>
        </div>

        <div className="biloo-signup-grid biloo-signup-name-grid">
          <label>
            <FieldLabel>First name</FieldLabel>
            <input
              autoCapitalize="words"
              autoComplete="given-name"
              className={authInputClass}
              disabled={step !== 0}
              maxLength={50}
              minLength={2}
              onChange={(event) => updateField("firstName", event.target.value)}
              placeholder="Mahir"
              required
              value={values.firstName}
            />
          </label>
          <label>
            <FieldLabel>Father’s name</FieldLabel>
            <input
              autoCapitalize="words"
              autoComplete="additional-name"
              className={authInputClass}
              disabled={step !== 0}
              maxLength={50}
              minLength={2}
              onChange={(event) => updateField("fatherName", event.target.value)}
              placeholder="Aman"
              required
              value={values.fatherName}
            />
          </label>
          <label>
            <FieldLabel>Grandfather’s name</FieldLabel>
            <input
              autoCapitalize="words"
              className={authInputClass}
              disabled={step !== 0}
              maxLength={50}
              minLength={2}
              onChange={(event) => updateField("grandfatherName", event.target.value)}
              placeholder="Biftu"
              required
              value={values.grandfatherName}
            />
          </label>
        </div>
      </section>

      <section
        className="biloo-signup-section biloo-signup-panel"
        data-signup-panel="1"
        hidden={step !== 1}
      >
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">2</span>
          <div>
            <h2>Account details</h2>
            <p>Your username and contact details identify your BILOO account.</p>
          </div>
        </div>

        <div className="biloo-signup-grid">
          <label className="biloo-signup-wide">
            <FieldLabel>Username</FieldLabel>
            <div className="biloo-signup-username-field" data-valid={usernameValid}>
              <span aria-hidden="true">@</span>
              <input
                aria-describedby="biloo-username-help"
                autoCapitalize="none"
                autoComplete="username"
                className={authInputClass}
                disabled={step !== 1}
                inputMode="text"
                maxLength={30}
                minLength={3}
                onChange={(event) => updateUsername(event.target.value)}
                pattern="[a-z][a-z0-9._]{2,29}"
                placeholder="mahir.biloo"
                required
                spellCheck={false}
                value={values.username}
              />
              {values.username ? (
                <Icon
                  className="size-[17px]"
                  name={usernameValid ? "check" : "alert"}
                />
              ) : null}
            </div>
            <small id="biloo-username-help" className="biloo-signup-help">
              3–30 characters. Start with a letter; use letters, numbers, dots or underscores.
            </small>
          </label>

          <label>
            <FieldLabel>Ethiopian mobile number</FieldLabel>
            <EthiopianPhoneInput
              className={authInputClass}
              disabled={step !== 1}
              name="phone"
              onValueChange={(value) => updateField("phone", value)}
              required
              value={values.phone}
            />
            <small className="biloo-signup-help">
              +251 is fixed. Enter only the 9 digits beginning with 9 or 7.
            </small>
          </label>

          <label>
            <FieldLabel>Email address</FieldLabel>
            <input
              autoCapitalize="none"
              autoComplete="email"
              className={authInputClass}
              disabled={step !== 1}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={values.email}
            />
          </label>
        </div>
      </section>

      <section
        className="biloo-signup-section biloo-signup-panel"
        data-signup-panel="2"
        hidden={step !== 2}
      >
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">3</span>
          <div>
            <h2>Location</h2>
            <p>This helps BILOO prepare local services and saved delivery details.</p>
          </div>
        </div>

        <div className="biloo-signup-grid">
          <label>
            <FieldLabel>Region or city administration</FieldLabel>
            <select
              className={authInputClass}
              disabled={step !== 2}
              onChange={(event) => updateField("region", event.target.value)}
              required
              value={values.region}
            >
              <option disabled value="">
                Select region
              </option>
              {ethiopianRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label>
            <FieldLabel>City or town</FieldLabel>
            <input
              autoCapitalize="words"
              autoComplete="address-level2"
              className={authInputClass}
              disabled={step !== 2}
              minLength={2}
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="Addis Ababa"
              required
              value={values.city}
            />
          </label>

          <label>
            <FieldLabel optional>Sub-city or zone</FieldLabel>
            <input
              autoCapitalize="words"
              autoComplete="address-level3"
              className={authInputClass}
              disabled={step !== 2}
              onChange={(event) => updateField("subCity", event.target.value)}
              placeholder="Bole"
              value={values.subCity}
            />
          </label>

          <label>
            <FieldLabel optional>Woreda</FieldLabel>
            <input
              autoCapitalize="words"
              className={authInputClass}
              disabled={step !== 2}
              onChange={(event) => updateField("woreda", event.target.value)}
              placeholder="Woreda 03"
              value={values.woreda}
            />
          </label>
        </div>
      </section>

      <section
        className="biloo-signup-section biloo-signup-panel"
        data-signup-panel="3"
        hidden={step !== 3}
      >
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">4</span>
          <div>
            <h2>Security and review</h2>
            <p>Create your password and confirm the information sent to BILOO.</p>
          </div>
        </div>

        <div className="biloo-signup-review" aria-label="Registration summary">
          <div>
            <span>Full name</span>
            <strong>{`${values.firstName} ${values.fatherName} ${values.grandfatherName}`.trim()}</strong>
          </div>
          <div>
            <span>Username</span>
            <strong>@{values.username}</strong>
          </div>
          <div>
            <span>Mobile</span>
            <strong>{values.phone}</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{[values.city, values.region].filter(Boolean).join(", ")}</strong>
          </div>
        </div>

        <div className="biloo-signup-grid">
          <label>
            <FieldLabel>Password</FieldLabel>
            <input
              autoComplete="new-password"
              className={authInputClass}
              disabled={step !== 3}
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={password}
            />
          </label>

          <label>
            <FieldLabel>Confirm password</FieldLabel>
            <input
              aria-invalid={confirmPassword.length > 0 && !passwordChecks.match}
              autoComplete="new-password"
              className={authInputClass}
              disabled={step !== 3}
              minLength={8}
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter password again"
              required
              type="password"
              value={confirmPassword}
            />
          </label>
        </div>

        <div className="biloo-signup-password-checks" aria-live="polite">
          <span data-complete={passwordChecks.length}>8 or more characters</span>
          <span data-complete={passwordChecks.letter}>Contains a letter</span>
          <span data-complete={passwordChecks.number}>Contains a number</span>
          <span data-complete={passwordChecks.match}>Passwords match</span>
        </div>

        <label className="biloo-signup-consent">
          <input disabled={step !== 3} name="terms" required type="checkbox" />
          <span>
            I agree to the BILOO <Link href="/terms">Terms of Service</Link> and acknowledge the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>

        <input disabled={step !== 3} name="firstName" type="hidden" value={values.firstName} />
        <input disabled={step !== 3} name="fatherName" type="hidden" value={values.fatherName} />
        <input disabled={step !== 3} name="grandfatherName" type="hidden" value={values.grandfatherName} />
        <input disabled={step !== 3} name="username" type="hidden" value={values.username} />
        <input disabled={step !== 3} name="phone" type="hidden" value={values.phone} />
        <input disabled={step !== 3} name="email" type="hidden" value={values.email} />
        <input disabled={step !== 3} name="region" type="hidden" value={values.region} />
        <input disabled={step !== 3} name="city" type="hidden" value={values.city} />
        <input disabled={step !== 3} name="subCity" type="hidden" value={values.subCity} />
        <input disabled={step !== 3} name="woreda" type="hidden" value={values.woreda} />
      </section>

      <div className="biloo-signup-navigation">
        <button
          className="biloo-signup-previous"
          disabled={step === 0}
          onClick={goPrevious}
          type="button"
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>

        <span className="biloo-signup-step-count">
          Step {step + 1} of {signupSteps.length}
        </span>

        {step < finalStep ? (
          <button className="biloo-signup-next" onClick={goNext} type="button">
            Next
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <SubmitButton passwordReady={passwordReady} />
        )}
      </div>

      <p className="biloo-signup-security-note">
        <Icon className="size-[15px]" name="shield" />
        Your profile is submitted securely to Supabase only after final confirmation.
      </p>
    </form>
  );
}
