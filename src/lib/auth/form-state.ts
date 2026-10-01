export type AuthActionState = {
  error: string | null;
  step?: number;
};

export const initialAuthState: AuthActionState = { error: null };

/** Accept local destinations only, including when interpreted as a URL. */
export function authDestination(requested: string | null | undefined) {
  if (
    !requested?.startsWith("/") ||
    requested.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(requested)
  ) {
    return "/biloo";
  }
  return requested;
}

export function authMessage(error: {
  code?: string;
  message: string;
  status?: number;
}) {
  if (
    error.status === 0 ||
    (error.status && error.status >= 500) ||
    !error.message ||
    error.message === "{}"
  ) {
    return authUnavailableMessage;
  }
  switch (error.code) {
    case "pkce_code_verifier_not_found":
      return "Open the confirmation link in the same browser you used to create your account, then try again.";
    case "flow_state_expired":
    case "otp_expired":
      return "This confirmation link has expired. Please request a new link and try again.";
    case "invalid_credentials":
      return "The email or password is incorrect. Try again or reset your password.";
    case "email_not_confirmed":
      return "Confirm your email using the link in your inbox before signing in.";
    case "email_address_not_authorized":
      return "Email delivery is not configured for this address. Please contact BILOO support.";
    case "over_email_send_rate_limit":
      return "Too many emails were requested. Please wait a few minutes and try again.";
    case "signup_disabled":
      return "Account registration is temporarily unavailable. Please contact BILOO support.";
    case "unexpected_failure":
      return "Your account could not be created. Please try again or contact BILOO support.";
    default:
      return error.message;
  }
}

export const authUnavailableMessage =
  "Authentication is temporarily unavailable. Please try again shortly.";
