"use client";

import { useFormStatus } from "react-dom";

export function AppEntryGoogleButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className="biloo-entry-google"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <span aria-hidden="true" className="biloo-entry-spinner" />
      ) : (
        <GoogleMark />
      )}
      <span>{pending ? "Connecting securely…" : "Continue with Google"}</span>
    </button>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="biloo-entry-google-mark"
      viewBox="0 0 24 24"
    >
      <path
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 13.8a6 6 0 0 1 0-3.6V7.6H2.9a10 10 0 0 0 0 8.8l3.3-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.9c1.5 0 2.9.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 2.9 7.6l3.3 2.6C7 7.7 9.3 5.9 12 5.9Z"
        fill="#EA4335"
      />
    </svg>
  );
}
