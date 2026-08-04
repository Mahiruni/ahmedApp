"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Icon } from "@/components/biloo/ui";
import { signUpAction } from "@/app/auth/actions";

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
              maxLength={50}
              minLength={2}
              name="firstName"
              placeholder="Mahir"
              required
            />
          </label>
          <label>
            <FieldLabel>Father’s name</FieldLabel>
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
            <FieldLabel>Grandfather’s name</FieldLabel>
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
          <span className="biloo-signup-step">2</span>
          <div>
            <h2>Account details</h2>
            <p>Your username identifies you inside BILOO.</p>
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
              3–30 characters. Start with a letter; use letters, numbers, dots or underscores.
            </small>
          </label>

          <label>
            <FieldLabel>Ethiopian mobile number</FieldLabel>
            <input
              autoComplete="tel"
              className={authInputClass}
              inputMode="tel"
              name="phone"
              placeholder="0912 345 678"
              required
              type="tel"
            />
          </label>

          <label>
            <FieldLabel>Email address</FieldLabel>
            <input
              autoCapitalize="none"
              autoComplete="email"
              className={authInputClass}
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>
        </div>
      </section>

      <section className="biloo-signup-section">
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
              defaultValue=""
              name="region"
              required
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
          <span className="biloo-signup-step">4</span>
          <div>
            <h2>Security</h2>
            <p>Create a password that you do not use on another service.</p>
          </div>
        </div>

        <div className="biloo-signup-grid">
          <label>
            <FieldLabel>Password</FieldLabel>
            <input
              autoComplete="new-password"
              className={authInputClass}
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
              aria-invalid={
                confirmPassword.length > 0 && !passwordChecks.match
              }
              autoComplete="new-password"
              className={authInputClass}
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
      </section>

      <label className="biloo-signup-consent">
        <input name="terms" required type="checkbox" />
        <span>
          I agree to the BILOO Terms of Service and acknowledge the Privacy Notice.
        </span>
      </label>

      <SubmitButton passwordReady={passwordReady} />
      <p className="biloo-signup-security-note">
        <Icon className="size-[15px]" name="shield" />
        Your password is handled by Supabase Auth and is never stored in this form.
      </p>
    </form>
  );
}
