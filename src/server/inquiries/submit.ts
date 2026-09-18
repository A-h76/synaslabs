"use server";

import { inquiryMailto, inquirySchema, type Inquiry } from "@/domain/inquiry";
import { ingestPublicInquiry } from "@/server/dal/intake";
import { inquiryRateOk } from "@/server/http/rate-limit";

export type InquiryState = {
  ok: boolean
  errors?: Partial<Record<keyof Inquiry | "form", string>>
  mailto?: string
  stored?: boolean
};

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  if (field(formData, "company_website")) {
    return { ok: true };
  }

  if (!(await inquiryRateOk())) {
    return {
      ok: false,
      errors: {
        form: "Too many project notes from this network. Wait a few minutes, or email hello@synaslabs.com.",
      },
    };
  }

  const parsed = inquirySchema.safeParse({
    businessName: field(formData, "businessName"),
    website: field(formData, "website"),
    contactName: field(formData, "contactName"),
    email: field(formData, "email"),
    role: field(formData, "role"),
    currentProcess: field(formData, "currentProcess"),
    painPoints: field(formData, "painPoints"),
    tools: field(formData, "tools"),
    manualWork: field(formData, "manualWork"),
    desiredOutcome: field(formData, "desiredOutcome"),
    integrations: field(formData, "integrations"),
    timeline: field(formData, "timeline"),
    budget: field(formData, "budget"),
    requirements: field(formData, "requirements"),
    briefJson: field(formData, "briefJson"),
  });

  if (!parsed.success) {
    const errors: InquiryState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key as keyof Inquiry]) {
        errors[key as keyof Inquiry] = issue.message;
      }
    }
    errors.form = "A few fields still need to be filled in.";
    return { ok: false, errors };
  }

  let stored = false;
  try {
    const result = await ingestPublicInquiry(parsed.data);
    stored = Boolean(result);
  } catch {
    stored = false;
  }

  return {
    ok: true,
    stored,
    mailto: inquiryMailto(parsed.data),
  };
}
