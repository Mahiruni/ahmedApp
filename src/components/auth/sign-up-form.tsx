"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { initialAuthState } from "@/lib/auth/form-state";
import { useFormStatus } from "react-dom";

import { signUpAction } from "@/app/auth/actions";
import { Icon } from "@/components/biloo/ui";
import { EthiopianPhoneInput } from "@/components/forms/ethiopian-phone-input";

import { AuthError, authInputClass } from "./auth-shell";

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
      className="biloo-signup-nav-primary biloo-signup-submit"
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
          <span>Create Account</span>
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
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialAuthState,
  );
  const [navigation, setNavigation] = useState({
    step: 1,
    result: initialAuthState,
  });
  const step =
    navigation.result !== state && state.step ? state.step : navigation.step;
  function setStep(nextStep: number) {
    setNavigation({ step: nextStep, result: state });
  }
  const [fields, setFields] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);

  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      formRef.current?.querySelector<HTMLElement>(".is-active h2")?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (!state.error) return;
    const frame = requestAnimationFrame(() => errorRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [state]);

  function fieldProps(name: string) {
    return {
      name,
      value: fields[name] ?? "",
      onChange: (
        event: ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => setFields((current) => ({ ...current, [name]: event.target.value })),
    };
  }

  function invalidField(sectionIndex: number) {
    const section = formRef.current?.querySelectorAll(
      ".biloo-signup-step-panel",
    )[sectionIndex];
    return Array.from(
      section?.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input:not([type="hidden"]), select, textarea') ?? [],
    ).find((field) => !field.checkValidity());
  }

  function showInvalid(
    field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    targetStep: number,
  ) {
    setStep(targetStep);
    requestAnimationFrame(() => {
      field.focus();
      field.reportValidity();
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (step < 4) {
      event.preventDefault();
      const invalid = invalidField(step - 1);
      if (invalid) showInvalid(invalid, step);
      else setStep(step + 1);
      return;
    }
    for (let index = 0; index < 4; index++) {
      const invalid = invalidField(index);
      if (invalid) {
        event.preventDefault();
        showInvalid(invalid, index + 1);
        return;
      }
    }
    if (!passwordReady || pending) event.preventDefault();
  }

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

  function handleNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const invalid = invalidField(step - 1);
    if (invalid) showInvalid(invalid, step);
    else if (step < 4) setStep(step + 1);
  }
  function handlePrevious(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (step > 1) setStep(step - 1);
  }
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
    <form
      ref={formRef}
      action={formAction}
      className="biloo-signup-form"
      noValidate
      onSubmit={handleSubmit}
      onReset={(event) => event.preventDefault()}
    >
      {state.error ? (
        <div ref={errorRef} tabIndex={-1}>
          <AuthError message={state.error} />
        </div>
      ) : null}
      <div className="biloo-signup-progress">
        <button
          aria-label="Go back one step"
          className="biloo-signup-back"
          disabled={step === 1 || pending}
          onClick={handlePrevious}
          type="button"
        >
          <Icon className="size-[17px] biloo-signup-back-icon" name="arrow" />
        </button>
        <div className="biloo-signup-progress-copy">
          <span>Account setup</span>
          <strong>Step {step} of 4</strong>
        </div>
        <div
          className="biloo-signup-progress-track"
          aria-label={"Step " + step + " of 4"}
        >
          <span style={{ width: step * 25 + "%" }} />
        </div>
      </div>

      <div className="biloo-signup-step-viewport">
        <section
          className={
            "biloo-signup-section biloo-signup-step-panel " +
            (step === 1 ? "is-active" : "")
          }
          aria-hidden={step !== 1}
          inert={step !== 1}
        >
          <div className="biloo-signup-section-heading">
            <span className="biloo-signup-step">1</span>
            <div>
              <h2 tabIndex={-1}>Personal information</h2>
              <p>
                Tell us who you are so your account is ready for everyday BILOO
                services.
              </p>
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
                {...fieldProps("firstName")}
                placeholder="Enter your first name"
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
                {...fieldProps("fatherName")}
                placeholder="Enter your father’s name"
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
                {...fieldProps("grandfatherName")}
                placeholder="Enter your grandfather’s name"
                required
              />
            </label>
          </div>
        </section>

        <section
          className={
            "biloo-signup-section biloo-signup-step-panel " +
            (step === 2 ? "is-active" : "")
          }
          aria-hidden={step !== 2}
          inert={step !== 2}
        >
          <div className="biloo-signup-section-heading">
            <span className="biloo-signup-step">2</span>
            <div>
              <h2 tabIndex={-1}>Account details</h2>
              <p>Choose how BILOO should identify and securely contact you.</p>
            </div>
          </div>
          <div className="biloo-signup-grid">
            <label className="biloo-signup-wide">
              <FieldLabel>Username</FieldLabel>
              <div
                className="biloo-signup-username-field"
                data-valid={usernameValid}
              >
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
                  placeholder="Choose a username"
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
                3–30 characters. Start with a letter; use letters, numbers, dots
                or underscores.
              </small>
            </label>
            <label>
              <FieldLabel>Ethiopian mobile number</FieldLabel>
              <EthiopianPhoneInput
                className={authInputClass}
                name="phone"
                required
              />
              <small className="biloo-signup-help">
                +251 is added automatically.
              </small>
            </label>
            <label>
              <FieldLabel>Email address</FieldLabel>
              <input
                autoCapitalize="none"
                autoComplete="email"
                className={authInputClass}
                inputMode="email"
                {...fieldProps("email")}
                placeholder="example@email.com"
                required
                type="email"
              />
            </label>
          </div>
        </section>

        <section
          className={
            "biloo-signup-section biloo-signup-step-panel " +
            (step === 3 ? "is-active" : "")
          }
          aria-hidden={step !== 3}
          inert={step !== 3}
        >
          <div className="biloo-signup-section-heading">
            <span className="biloo-signup-step">3</span>
            <div>
              <h2 tabIndex={-1}>Delivery details</h2>
              <p>
                Add the location where your orders and services should reach
                you.
              </p>
            </div>
          </div>
          <div className="biloo-signup-grid">
            <label>
              <FieldLabel>Region or city administration</FieldLabel>
              <select
                className={authInputClass}
                {...fieldProps("region")}
                required
              >
                <option disabled value="">
                  Select your region
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
                {...fieldProps("city")}
                minLength={2}
                placeholder="Enter your city or town"
                required
              />
            </label>
            <label className="biloo-signup-wide">
              <FieldLabel>Delivery address</FieldLabel>
              <input
                autoCapitalize="sentences"
                autoComplete="street-address"
                className={authInputClass}
                {...fieldProps("address")}
                minLength={3}
                placeholder="Enter your delivery address"
                required
              />
            </label>
            <label>
              <FieldLabel optional>Sub-city or zone</FieldLabel>
              <input
                autoCapitalize="words"
                autoComplete="address-level3"
                className={authInputClass}
                {...fieldProps("subCity")}
                placeholder="Enter sub-city or zone"
              />
            </label>
            <label>
              <FieldLabel optional>Woreda</FieldLabel>
              <input
                autoCapitalize="words"
                className={authInputClass}
                {...fieldProps("woreda")}
                placeholder="Enter woreda"
              />
            </label>
            <label className="biloo-signup-wide">
              <FieldLabel optional>Notes</FieldLabel>
              <textarea
                className={authInputClass + " biloo-signup-notes"}
                {...fieldProps("notes")}
                placeholder="Add any special instructions…"
                rows={3}
              />
            </label>
          </div>
        </section>

        <section
          className={
            "biloo-signup-section biloo-signup-step-panel " +
            (step === 4 ? "is-active" : "")
          }
          aria-hidden={step !== 4}
          inert={step !== 4}
        >
          <div className="biloo-signup-section-heading">
            <span className="biloo-signup-step">4</span>
            <div>
              <h2 tabIndex={-1}>Security</h2>
              <p>Create a strong password and finish your BILOO account.</p>
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
                placeholder="Create a password"
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
                placeholder="Confirm your password"
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          </div>
          <div className="biloo-signup-password-checks" aria-live="polite">
            <span data-complete={passwordChecks.length}>
              8 or more characters
            </span>
            <span data-complete={passwordChecks.letter}>Contains a letter</span>
            <span data-complete={passwordChecks.number}>Contains a number</span>
            <span data-complete={passwordChecks.match}>Passwords match</span>
          </div>
          <label className="biloo-signup-consent">
            <input
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              name="terms"
              required
              type="checkbox"
            />
            <span>
              I agree to the BILOO <Link href="/terms">Terms of Service</Link>{" "}
              and acknowledge the <Link href="/privacy">Privacy Policy</Link>.
            </span>
          </label>
        </section>
      </div>

      <div className="biloo-signup-navigation">
        {step > 1 ? (
          <button
            className="biloo-signup-nav-secondary"
            disabled={pending}
            onClick={handlePrevious}
            type="button"
          >
            Previous
          </button>
        ) : (
          <span />
        )}
        {step < 4 ? (
          <button
            className="biloo-signup-nav-primary"
            disabled={pending}
            onClick={handleNext}
            type="button"
          >
            Continue <Icon className="size-[16px]" name="arrow" />
          </button>
        ) : (
          <SubmitButton passwordReady={passwordReady} />
        )}
      </div>

      <p className="biloo-signup-security-note">
        <Icon className="size-[15px]" name="shield" /> Your password is
        protected by Supabase Auth.
      </p>
    </form>
  );
}
