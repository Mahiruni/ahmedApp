"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { signInAction } from "@/app/auth/actions";
import { Icon } from "@/components/biloo/ui";

import { authButtonClass, authInputClass } from "./auth-shell";

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={`${authButtonClass} biloo-auth-primary-action`}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <span aria-hidden="true" className="biloo-feedback-spinner" />
          <span>Signing in…</span>
        </>
      ) : (
        <>
          <span>Sign in</span>
          <Icon aria-hidden="true" className="size-[17px]" name="arrow" />
        </>
      )}
    </button>
  );
}

export function AuthGoogleButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className="biloo-auth-google-button"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <span aria-hidden="true" className="biloo-feedback-spinner" />
      ) : (
        <svg aria-hidden="true" className="biloo-auth-google-icon" viewBox="0 0 24 24">
          <path
            d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z"
            fill="#4285F4"
          />
          <path
            d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z"
            fill="#34A853"
          />
          <path
            d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.3L6.5 14Z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.8 9.8 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{pending ? "Connecting…" : label}</span>
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={signInAction} className="biloo-login-form">
      <input name="next" type="hidden" value={next} />

      <label className="biloo-auth-field">
        <span>Email address</span>
        <input
          autoCapitalize="none"
          autoComplete="email"
          className={authInputClass}
          inputMode="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </label>

      <label className="biloo-auth-field">
        <span>Password</span>
        <span className="biloo-auth-password-field">
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
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      <div className="biloo-auth-form-options">
        <label className="biloo-auth-remember">
          <input name="rememberDevice" type="checkbox" />
          <span>Remember me</span>
        </label>
        <Link href="/auth/forgot-password">Forgot password?</Link>
      </div>

      <SignInButton />
    </form>
  );
}
