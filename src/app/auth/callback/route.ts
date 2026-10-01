import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  authDestination,
  authMessage,
  authUnavailableMessage,
} from "@/lib/auth/form-state";
import type { EmailOtpType } from "@supabase/supabase-js";

const emailTypes = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Next.js may construct request.url with the internal server hostname.
  // Keep the browser on the public host where its auth cookies were issued.
  const publicHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const publicProtocol = request.headers.get("x-forwarded-proto");
  if (publicHost) url.host = publicHost;
  if (publicProtocol === "https" || publicProtocol === "http")
    url.protocol = `${publicProtocol}:`;
  const code = url.searchParams.get("code");
  const next = authDestination(url.searchParams.get("next"));
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  let message =
    "This sign-in link is invalid or has expired. Please try signing in again.";

  try {
    if (code || (tokenHash && type && emailTypes.has(type))) {
      const supabase = await createClient();
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.verifyOtp({
            token_hash: tokenHash!,
            type: type as EmailOtpType,
          });
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
      message = authMessage(error);
    }
  } catch {
    message = authUnavailableMessage;
  }
  const login = new URL("/auth/login", url.origin);
  login.searchParams.set("error", message);
  login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
