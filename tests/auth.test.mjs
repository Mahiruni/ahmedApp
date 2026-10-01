import assert from "node:assert/strict";
import test from "node:test";

import {
  authDestination,
  authMessage,
  authUnavailableMessage,
} from "../src/lib/auth/form-state.ts";

test("authentication preserves local destinations and their query strings", () => {
  assert.equal(authDestination("/account?tab=orders"), "/account?tab=orders");
  assert.equal(
    authDestination("/auth/update-password"),
    "/auth/update-password",
  );
});

test("authentication rejects destinations that can escape the application origin", () => {
  for (const next of [
    null,
    "https://other.example",
    "//other.example",
    "/\\other.example",
    "/\n/other.example",
    "javascript:alert(1)",
  ]) {
    assert.equal(authDestination(next), "/biloo");
  }
});

test("credential and confirmation failures give actionable errors", () => {
  assert.match(
    authMessage({
      code: "invalid_credentials",
      message: "Invalid login credentials",
      status: 400,
    }),
    /reset your password/,
  );
  assert.match(
    authMessage({
      code: "email_not_confirmed",
      message: "Email not confirmed",
      status: 400,
    }),
    /Confirm your email/,
  );
});

test("backend failures are not mislabeled as username conflicts", () => {
  assert.equal(
    authMessage({ status: 500, message: "Database error saving new user" }),
    authUnavailableMessage,
  );
  assert.equal(
    authMessage({ status: 503, message: "{}" }),
    authUnavailableMessage,
  );
});

test("email delivery restrictions are distinguished from user input errors", () => {
  assert.match(
    authMessage({
      code: "email_address_not_authorized",
      message: "Email address not authorized",
      status: 400,
    }),
    /Email delivery is not configured/,
  );
  assert.match(
    authMessage({
      code: "over_email_send_rate_limit",
      message: "Rate limit",
      status: 429,
    }),
    /wait a few minutes/,
  );
});
