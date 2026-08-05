"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
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

function FieldLabel({
  children,
  optional = false,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <span className="biloo-signup-field-label">
      <span>{children}</span>
      {optional ? <small>Optional</small> : null}
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
          <span className="biloo-auth-spinner" aria-hidden="true" />
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const usernameValid = /^[a-z][a-z0-9._]{2,29}$/.test(username);
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

  function updateUsername(value: string) {
    setUsername(
      value
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9._]/g, "")
        .slice(0, 30),
    );
  }

  return (
    <form action={signUpAction} className="biloo-signup-form">
      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">01</span>
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
              maxLength={50}
              minLength={2}
              name="firstName"
              placeholder="Mahir"
              required
            />
          </label>
          <label>
            <FieldLabel>Father&apos;s name</FieldLabel>
            <input
              autoCapitalize="words"
              autoComplete="additional-name"
              className={authInputClass}
              maxLength={50}
              minLength={2}
              name="fatherName"
              placeholder="Aman"
              required
            />
          </label>
          <label>
            <FieldLabel>Grandfather&apos;s name</FieldLabel>
            <input
              autoCapitalize="words"
              className={authInputClass}
              maxLength={50}
              minLength={2}
              name="grandfatherName"
              placeholder="Biftu"
              required
            />
          </label>
        </div>
      </section>

      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">02</span>
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
                inputMode="text"
                maxLength={30}
                minLength={3}
                name="username"
                onChange={(event) => updateUsername(event.target.value)}
                pattern="[a-z][a-z0-9._]{2,29}"
                placeholder="mahir.biloo"
                required
                spellCheck={false}
                value={username}
              />
              {username ? (
                <Icon
                  className="size-[17px]"
                  name={usernameValid ? "check" : "alert"}
                />
              ) : null}
            </div>
            <small id="biloo-username-help" className="biloo-signup-help">
              Start with a letter. Use letters, numbers, dots or underscores.
            </small>
          </label>

          <label>
            <FieldLabel>Ethiopian mobile number</FieldLabel>
            <EthiopianPhoneInput
              className={authInputClass}
              describedBy="biloo-signup-phone-help"
              name="phone"
              required
            />
            <small id="biloo-signup-phone-help" className="biloo-signup-help">
              +251 is fixed. Enter only the 9 digits beginning with 7 or 9.
            </small>
          </label>

          <label>
            <FieldLabel>Email address</FieldLabel>
            <input
              autoCapitalize="none"
              autoComplete="email"
              className={authInputClass}
              inputMode="email"
              name="email"
              placeholder="you@example.com"
              required
              spellCheck={false}
              type="email"
            />
          </label>
        </div>
      </section>

      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">03</span>
          <div>
            <h2>Local address</h2>
            <p>Used to prepare saved delivery details and nearby services.</p>
          </div>
        </div>

        <div className="biloo-signup-grid">
          <label>
            <FieldLabel>Region or city administration</FieldLabel>
            <select className={authInputClass} defaultValue="" name="region" required>
              <option disabled value="">Select region</option>
              {ethiopianRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </label>

          <label>
            <FieldLabel>City or town</FieldLabel>
            <input
              autoCapitalize="words"
              autoComplete="address-level2"
              className={authInputClass}
              name="city"
              placeholder="Addis Ababa"
              required
            />
          </label>

          <label>
            <FieldLabel optional>Sub-city or zone</FieldLabel>
            <input
              autoCapitalize="words"
              autoComplete="address-level3"
              className={authInputClass}
              name="subCity"
              placeholder="Bole"
            />
          </label>

          <label>
            <FieldLabel optional>Woreda</FieldLabel>
            <input
              autoCapitalize="words"
              className={authInputClass}
              name="woreda"
              placeholder="Woreda 03"
            />
          </label>
        </div>
      </section>

      <section className="biloo-signup-section">
        <div className="biloo-signup-section-heading">
          <span className="biloo-signup-step">04</span>
          <div>
            <h2>Secure your account</h2>
            <p>Create a password you do not use on another service.</p>
          </div>
        </div>

        <div className="biloo-signup-grid">
          <label>
            <FieldLabel>Password</FieldLabel>
            <div className="biloo-auth-password-frame">
              <input
                autoComplete="new-password"
                className={authInputClass}
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="biloo-auth-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label>
            <FieldLabel>Confirm password</FieldLabel>
            <div className="biloo-auth-password-frame">
              <input
                aria-invalid={confirmPassword.length > 0 && !passwordChecks.match}
                autoComplete="new-password"
                className={authInputClass}
                minLength={8}
                name="confirmPassword"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter password again"
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
              />
              <button
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="biloo-auth-password-toggle"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                type="button"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
        </div>

        <div className="biloo-signup-password-checks" aria-live="polite">
          <span data-complete={passwordChecks.length}>8+ characters</span>
          <span data-complete={passwordChecks.letter}>Contains a letter</span>
          <span data-complete={passwordChecks.number}>Contains a number</span>
          <span data-complete={passwordChecks.match}>Passwords match</span>
        </div>
      </section>

      <label className="biloo-signup-consent">
        <input name="terms" required type="checkbox" />
        <span>
          I agree to the BILOO <Link href="/terms">Terms of Service</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>.
        </span>
      </label>

      <SubmitButton passwordReady={passwordReady} />
      <p className="biloo-signup-security-note">
        <Icon className="size-[15px]" name="shield" />
        Authentication is protected by Supabase. BILOO never stores your password in this form.
      </p>
    </form>
  );
}
