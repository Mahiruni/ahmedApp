"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireViewer } from "@/lib/biloo/auth";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeFilter(value: string) {
  return ["pending", "approved", "rejected", "all"].includes(value)
    ? value
    : "pending";
}

export async function reviewRoleApplicationAction(formData: FormData) {
  const applicationId = value(formData, "applicationId");
  const decision = value(formData, "decision");
  const notes = value(formData, "notes").slice(0, 600);
  const currentFilter = safeFilter(value(formData, "currentFilter"));

  const viewer = await requireViewer();
  if (viewer.databaseRole !== "admin") redirect("/biloo");

  if (!applicationId || (decision !== "approved" && decision !== "rejected")) {
    redirect(
      `/admin/role-applications?status=${currentFilter}&error=${encodeURIComponent(
        "Choose a valid review decision.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_biloo_role_application", {
    p_application_id: applicationId,
    p_status: decision,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      `/admin/role-applications?status=${currentFilter}&error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin/role-applications");
  revalidatePath("/biloo");

  const message =
    decision === "approved"
      ? "Application approved and operational access activated."
      : "Application rejected and the applicant was notified.";

  redirect(
    `/admin/role-applications?status=${currentFilter}&notice=${encodeURIComponent(
      message,
    )}`,
  );
}
