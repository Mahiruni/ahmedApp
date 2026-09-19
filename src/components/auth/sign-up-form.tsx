"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { signUpAction } from "@/app/auth/actions";
import { Icon } from "@/components/biloo/ui";
import { EthiopianPhoneInput } from "@/components/forms/ethiopian-phone-input";

import { authButtonClass, authInputClass } from "./auth-shell";

const ethiopianRegions = [
  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Central Ethiopia",
  "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "Somali",
  "South Ethiopia", "South West Ethiopia Peoples’ Region", "Tigray",
];

function FieldLabel({ children, optional = false }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <span className="biloo-signup-field-label">
      <span>{children}</span>
      {optional ? <span>Optional</span> : null}
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
          <span>Creating your secure account…</span>
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const usernameValid = /^[a-z][a-z0-9._]{2,29}$/.test(username);
  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  }), [confirmPassword, password]);
  const passwordReady = passwordChecks.length && passwordChecks.letter && passwordChecks.number && passwordChecks.match;

  function updateUsername(value: string) {
    setUsername(value.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9._]/g, "").slice(0, 30));
  }

  return (
    <form action={signUpAction} className="biloo-signup-form">
      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">1</span>
          <div><h2>Personal information</h2><p>Use your real details. Your information is only shown where needed for your BILOO account.</p></div>
        </div>

        <div className="biloo-signup-grid biloo-signup-name-grid">
          <label>
            <FieldLabel>First name</FieldLabel>
            <input autoCapitalize="words" autoComplete="given-name" className={authInputClass} maxLength={50} minLength={2} name="firstName" placeholder="Enter your first name" required />
          </label>
          <label>
            <FieldLabel>Father’s name</FieldLabel>
            <input autoCapitalize="words" autoComplete="additional-name" className={authInputClass} maxLength={50} minLength={2} name="fatherName" placeholder="Enter your father’s name" required />
          </label>
          <label>
            <FieldLabel>Grandfather’s name</FieldLabel>
            <input autoCapitalize="words" className={authInputClass} maxLength={50} minLength={2} name="grandfatherName" placeholder="Enter your grandfather’s name" required />
          </label>
        </div>
      </section>

      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">2</span>
          <div><h2>Account details</h2><p>Choose how you want BILOO to identify and contact you.</p></div>
        </div>

        <div className="biloo-signup-grid">
          <label className="biloo-signup-wide">
            <FieldLabel>Username</FieldLabel>
            <div className="biloo-signup-username-field" data-valid={usernameValid}>
              <span aria-hidden="true">@</span>
              <input aria-describedby="biloo-username-help" autoCapitalize="none" autoComplete="username" className={authInputClass} inputMode="text" maxLength={30} minLength={3} name="username" onChange={(event) => updateUsername(event.target.value)} pattern="[a-z][a-z0-9._]{2,29}" placeholder="Choose a username" required spellCheck={false} value={username} />
              {username ? <Icon className="size-[17px]" name={usernameValid ? "check" : "alert"} /> : null}
            </div>
            <small id="biloo-username-help" className="biloo-signup-help">3–30 characters. Start with a letter; use letters, numbers, dots or underscores.</small>
          </label>

          <label>
            <FieldLabel>Ethiopian mobile number</FieldLabel>
            <EthiopianPhoneInput className={authInputClass} name="phone" required />
            <small className="biloo-signup-help">+251 is added automatically. Enter the 9 digits starting with 9 or 7.</small>
          </label>

          <label>
            <FieldLabel>Email address</FieldLabel>
            <input autoCapitalize="none" autoComplete="email" className={authInputClass} inputMode="email" name="email" placeholder="example@email.com" required type="email" />
          </label>
        </div>
      </section>

      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">3</span>
          <div><h2>Delivery details</h2><p>Add your location so orders and services can reach you.</p></div>
        </div>

        <div className="biloo-signup-grid">
          <label>
            <FieldLabel>Region or city administration</FieldLabel>
            <select className={authInputClass} defaultValue="" name="region" required>
              <option disabled value="">Select your region</option>
              {ethiopianRegions.map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
          </label>

          <label>
            <FieldLabel>City or town</FieldLabel>
            <input autoCapitalize="words" autoComplete="address-level2" className={authInputClass} name="city" placeholder="Enter your city or town" required />
          </label>

          <label className="biloo-signup-wide">
            <FieldLabel>Delivery address</FieldLabel>
            <input autoCapitalize="sentences" autoComplete="street-address" className={authInputClass} name="address" placeholder="Enter your delivery address" required />
          </label>

          <label>
            <FieldLabel optional>Sub-city or zone</FieldLabel>
            <input autoCapitalize="words" autoComplete="address-level3" className={authInputClass} name="subCity" placeholder="Enter sub-city or zone" />
          </label>

          <label>
            <FieldLabel optional>Woreda</FieldLabel>
            <input autoCapitalize="words" className={authInputClass} name="woreda" placeholder="Enter woreda" />
          </label>

          <label className="biloo-signup-wide">
            <FieldLabel optional>Notes</FieldLabel>
            <textarea className={`${authInputClass} biloo-signup-notes`} name="notes" placeholder="Add any special instructions…" rows={3} />
          </label>
        </div>
      </section>

      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">4</span>
          <div><h2>Security</h2><p>Create a strong password for your account.</p></div>
        </div>

        <div className="biloo-signup-grid">
          <label>
            <FieldLabel>Password</FieldLabel>
            <input autoComplete="new-password" className={authInputClass} minLength={8} name="password" onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" required type="password" value={password} />
          </label>
          <label>
            <FieldLabel>Confirm password</FieldLabel>
            <input aria-invalid={confirmPassword.length > 0 && !passwordChecks.match} autoComplete="new-password" className={authInputClass} minLength={8} name="confirmPassword" onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" required type="password" value={confirmPassword} />
          </label>
        </div>

        <div className="biloo-signup-password-checks" aria-live="polite">
          <span data-complete={passwordChecks.length}>8 or more characters</span>
          <span data-complete={passwordChecks.letter}>Contains a letter</span>
          <span data-complete={passwordChecks.number}>Contains a number</span>
          <span data-complete={passwordChecks.match}>Passwords match</span>
        </div>
      </section>

      <label className="biloo-signup-consent">
        <input name="terms" required type="checkbox" />
        <span>I agree to the BILOO <Link href="/terms">Terms of Service</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>.</span>
      </label>

      <SubmitButton passwordReady={passwordReady} />
      <p className="biloo-signup-security-note"><Icon className="size-[15px]" name="shield" /> Your password is protected by Supabase Auth and is never stored in this form.</p>
    </form>
  );
}
