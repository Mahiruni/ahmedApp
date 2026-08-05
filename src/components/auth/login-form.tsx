"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { signInAction, signInWithGoogleAction } from "@/app/auth/actions";
import { Icon } from "@/components/biloo/ui";

import { authButtonClass, authInputClass } from "./auth-shell";

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={authButtonClass}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <span className="biloo-auth-spinner" aria-hidden="true" />
          Signing you in…
        </>
      ) : (
        <>
          Sign in securely
          <Icon className="size-[17px]" name="arrow" />
        </>
      )}
    </button>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className="biloo-auth-google"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <span className="biloo-auth-spinner biloo-auth-spinner-iris" aria-hidden="true" />
      ) : (
        <svg aria-hidden="true" className="biloo-auth-google-mark" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.19-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.86A6.02 6.02 0 0 1 6.07 12c0-.65.11-1.28.32-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z" />
          <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
        </svg>
      )}
      <span>{pending ? "Connecting to Google…" : "Continue with Google"}</span>
    </button>
  );
}

export function LoginForm({ next = "/biloo" }: { next?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="biloo-login-stack">
      <form action={signInAction} className="biloo-login-form">
        <input name="next" type="hidden" value={next} />

        <label className="biloo-auth-field">
          <span>Email address</span>
          <div className="biloo-auth-input-frame">
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
          </div>
        </label>

        <label className="biloo-auth-field">
          <span>Password</span>
          <div className="biloo-auth-password-frame">
            <input
              autoComplete="current-password"
              className={authInputClass}
              minLength={8}
              name="password"
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
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

        <div className="biloo-login-options">
          <span>Use the email connected to your BILOO account.</span>
          <Link href="/auth/forgot-password">Forgot password?</Link>
        </div>

        <SignInButton />
      </form>

      <div className="biloo-auth-divider" aria-hidden="true">
        <span />
        <b>or</b>
        <span />
      </div>

      <form action={signInWithGoogleAction}>
        <input name="next" type="hidden" value={next} />
        <input name="errorPath" type="hidden" value="/auth/login" />
        <GoogleButton />
      </form>

      <div className="biloo-auth-trust-note">
        <Icon className="size-[16px]" name="shield" />
        <p>
          BILOO uses encrypted authentication. Google sign-in requests only your basic profile information.
        </p>
      </div>
    </div>
  );
}
