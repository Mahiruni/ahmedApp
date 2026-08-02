"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function destination(formData: FormData) {
  const requested = value(formData, "next");
  return requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/biloo";
}

function authError(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signInAction(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  const next = destination(formData);

  if (!email || !password) {
    authError("/auth/login", "Email and password are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) authError("/auth/login", error.message);
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const displayName = value(formData, "displayName");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");

  if (displayName.length < 2) {
    authError("/auth/sign-up", "Enter your full name.");
  }
  if (!email || password.length < 8) {
    authError(
      "/auth/sign-up",
      "Use a valid email and a password with at least 8 characters.",
    );
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      data: { display_name: displayName },
    },
  });

  if (error) authError("/auth/sign-up", error.message);
  redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  if (!email) authError("/auth/forgot-password", "Enter your email address.");

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  if (error) authError("/auth/forgot-password", error.message);
  redirect(`/auth/check-email?email=${encodeURIComponent(email)}&reset=1`);
}

export async function updatePasswordAction(formData: FormData) {
  const password = value(formData, "password");
  if (password.length < 8) {
    authError(
      "/auth/update-password",
      "Password must contain at least 8 characters.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) authError("/auth/update-password", error.message);
  redirect("/biloo");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
