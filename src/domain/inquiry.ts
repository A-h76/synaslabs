import { z } from "zod";

export const inquirySchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Name the business.")
    .max(120, "Keep the business name shorter."),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  contactName: z
    .string()
    .trim()
    .min(2, "Your name is needed so we know who to reply to.")
    .max(80),
  email: z.string().trim().email("Use a working email."),
  role: z.string().trim().max(80).optional().or(z.literal("")),
  currentProcess: z
    .string()
    .trim()
    .min(12, "Describe the current process in a few sentences.")
    .max(4000),
  painPoints: z
    .string()
    .trim()
    .min(8, "Where does the work stall or get lost?")
    .max(2000),
  tools: z.string().trim().max(1000).optional().or(z.literal("")),
  manualWork: z.string().trim().max(2000).optional().or(z.literal("")),
  desiredOutcome: z
    .string()
    .trim()
    .min(8, "What should be true when this is working?")
    .max(2000),
  integrations: z.string().trim().max(1000).optional().or(z.literal("")),
  timeline: z.string().trim().max(200).optional().or(z.literal("")),
  budget: z.string().trim().max(200).optional().or(z.literal("")),
  requirements: z.string().trim().max(2000).optional().or(z.literal("")),
  briefJson: z.string().max(100000).optional().or(z.literal("")),
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

export type Inquiry = z.infer<typeof inquirySchema>;

export function inquiryMailto(inquiry: Inquiry): string {
  const lines = [
    `Business: ${inquiry.businessName}`,
    inquiry.website ? `Website: ${inquiry.website}` : null,
    `Contact: ${inquiry.contactName} <${inquiry.email}>`,
    inquiry.role ? `Role: ${inquiry.role}` : null,
    "",
    "Current process:",
    inquiry.currentProcess,
    "",
    "Pain:",
    inquiry.painPoints,
    inquiry.tools ? `\nTools:\n${inquiry.tools}` : null,
    inquiry.manualWork ? `\nStill manual:\n${inquiry.manualWork}` : null,
    "",
    "Desired outcome:",
    inquiry.desiredOutcome,
    inquiry.integrations ? `\nIntegrations:\n${inquiry.integrations}` : null,
    inquiry.timeline ? `\nTimeline: ${inquiry.timeline}` : null,
    inquiry.budget ? `\nBudget: ${inquiry.budget}` : null,
    inquiry.requirements ? `\nRequirements:\n${inquiry.requirements}` : null,
    inquiry.briefJson ? "\nA System Brief is attached from the site session." : null,
  ].filter((line): line is string => line !== null);

  const body = lines.join("\n").slice(0, 1800);
  const subject = `Project — ${inquiry.businessName}`;
  return `mailto:hello@synaslabs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
