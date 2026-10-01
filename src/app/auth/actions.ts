"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  authDestination,
  authMessage,
  authUnavailableMessage,
  type AuthActionState,
} from "@/lib/auth/form-state";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function destination(formData: FormData) {
  return authDestination(value(formData, "next"));
}

function passwordValue(formData: FormData, key = "password") {
  return String(formData.get(key) ?? "");
}

function authError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function requestOrigin() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

function normalizePersonName(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeUsername(input: string) {
  return input.toLowerCase().replace(/\s+/g, "").trim();
}

function normalizeEthiopianPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  const national = digits.startsWith("251")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  return /^[79]\d{8}$/.test(national) ? `+251${national}` : null;
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = value(formData, "email").toLowerCase();
  const password = passwordValue(formData);
  const next = destination(formData);
  if (!email || !password) return { error: "Email and password are required." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: authMessage(error) };
  } catch {
    return { error: authUnavailableMessage };
  }
  redirect(next);
}

export async function signInWithGoogleAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const next = destination(formData);
  const origin = await requestOrigin();
  let redirectUrl: string | null = null;
  try {
    const { url, publishableKey } = getSupabaseConfig();
    const settingsResponse = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: publishableKey },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!settingsResponse.ok) return { error: authUnavailableMessage };
    const settings = (await settingsResponse.json()) as {
      external?: { google?: boolean };
    };
    if (!settings.external?.google) {
      return {
        error:
          "Google sign-in is not configured yet. Please use email and password.",
      };
    }
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url)
      return { error: error ? authMessage(error) : authUnavailableMessage };
    redirectUrl = data.url;
  } catch {
    return { error: authUnavailableMessage };
  }
  redirect(redirectUrl);
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = normalizePersonName(value(formData, "firstName"));
  const fatherName = normalizePersonName(value(formData, "fatherName"));
  const grandfatherName = normalizePersonName(
    value(formData, "grandfatherName"),
  );
  const username = normalizeUsername(value(formData, "username"));
  const phone = normalizeEthiopianPhone(value(formData, "phone"));
  const email = value(formData, "email").toLowerCase();
  const region = value(formData, "region");
  const city = normalizePersonName(value(formData, "city"));
  const address = normalizePersonName(value(formData, "address"));
  const subCity = normalizePersonName(value(formData, "subCity"));
  const woreda = normalizePersonName(value(formData, "woreda"));
  const notes = value(formData, "notes");
  const password = passwordValue(formData);
  const confirmPassword = passwordValue(formData, "confirmPassword");
  const acceptedTerms = formData.get("terms") === "on";

  if (
    firstName.length < 2 ||
    fatherName.length < 2 ||
    grandfatherName.length < 2
  ) {
    return {
      error: "Enter your first name, father’s name and grandfather’s name.",
      step: 1,
    };
  }
  if (!/^[a-z][a-z0-9._]{2,29}$/.test(username)) {
    return {
      error:
        "Username must be 3–30 characters, start with a letter, and use only letters, numbers, dots or underscores.",
      step: 2,
    };
  }
  if (!phone)
    return { error: "Enter a valid Ethiopian mobile number.", step: 2 };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Enter a valid email address.", step: 2 };
  if (!region || city.length < 2 || address.length < 3) {
    return {
      error: "Select your region and enter your city and delivery address.",
      step: 3,
    };
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    return {
      error: "Use at least 8 characters, including a letter and a number.",
      step: 4,
    };
  if (password !== confirmPassword)
    return { error: "Passwords do not match.", step: 4 };
  if (!acceptedTerms)
    return {
      error:
        "Accept the BILOO terms and privacy notice to create your account.",
      step: 4,
    };

  const displayName = `${firstName} ${fatherName} ${grandfatherName}`;
  const origin = await requestOrigin();
  let sessionCreated = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
        data: {
          account_type: "customer",
          display_name: displayName,
          first_name: firstName,
          father_name: fatherName,
          grandfather_name: grandfatherName,
          username,
          phone,
          region,
          city,
          address,
          sub_city: subCity || null,
          woreda: woreda || null,
          notes: notes || null,
        },
      },
    });

    if (error) {
      const usernameTaken = /username.*(taken|exists|unique)/i.test(
        error.message,
      );
      return {
        error: usernameTaken
          ? "That username is already taken. Choose another username."
          : authMessage(error),
        step: usernameTaken ? 2 : 4,
      };
    }
    sessionCreated = Boolean(data.session);
  } catch {
    return { error: authUnavailableMessage };
  }
  if (sessionCreated) redirect("/onboarding");
  redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  if (!email) authError("/auth/forgot-password", "Enter your email address.");
  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (error) authError("/auth/forgot-password", error.message);
  redirect(`/auth/check-email?email=${encodeURIComponent(email)}&reset=1`);
}

export async function updatePasswordAction(formData: FormData) {
  const password = passwordValue(formData);
  if (password.length < 8)
    authError(
      "/auth/update-password",
      "Password must contain at least 8 characters.",
    );
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) authError("/auth/update-password", error.message);
  redirect("/biloo");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
