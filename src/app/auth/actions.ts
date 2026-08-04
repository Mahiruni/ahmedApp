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

export async function signInWithGoogleAction(formData: FormData) {
  const next = destination(formData);
  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: true,
    },
  });
  const redirectUrl = data.url;

  if (error || !redirectUrl) {
    authError(
      "/",
      error?.message ?? "Google sign-in is not available right now.",
    );
  }

  redirect(redirectUrl);
}

export async function signUpAction(formData: FormData) {
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
  const subCity = normalizePersonName(value(formData, "subCity"));
  const woreda = normalizePersonName(value(formData, "woreda"));
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirmPassword");
  const acceptedTerms = formData.get("terms") === "on";

  if (
    firstName.length < 2 ||
    fatherName.length < 2 ||
    grandfatherName.length < 2
  ) {
    authError(
      "/auth/sign-up",
      "Enter your first name, father’s name and grandfather’s name.",
    );
  }

  if (!/^[a-z][a-z0-9._]{2,29}$/.test(username)) {
    authError(
      "/auth/sign-up",
      "Username must be 3–30 characters, start with a letter, and use only letters, numbers, dots or underscores.",
    );
  }

  if (!phone) {
    authError(
      "/auth/sign-up",
      "Enter a valid Ethiopian mobile number such as 0912 345 678 or +251 912 345 678.",
    );
  }

  if (!email || !email.includes("@")) {
    authError("/auth/sign-up", "Enter a valid email address.");
  }

  if (!region || city.length < 2) {
    authError("/auth/sign-up", "Select your region and enter your city.");
  }

  if (password.length < 8) {
    authError(
      "/auth/sign-up",
      "Password must contain at least 8 characters.",
    );
  }

  if (password !== confirmPassword) {
    authError("/auth/sign-up", "Passwords do not match.");
  }

  if (!acceptedTerms) {
    authError(
      "/auth/sign-up",
      "Accept the BILOO terms and privacy notice to create your account.",
    );
  }

  const displayName = `${firstName} ${fatherName} ${grandfatherName}`;
  const origin = await requestOrigin();
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
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
        sub_city: subCity || null,
        woreda: woreda || null,
      },
    },
  });

  if (error) {
    const message = /username|database error saving new user/i.test(error.message)
      ? "That username is already taken. Choose another username."
      : error.message;
    authError("/auth/sign-up", message);
  }

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
  redirect("/");
}
