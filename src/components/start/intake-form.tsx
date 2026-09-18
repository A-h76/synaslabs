"use client";

import { useActionState, useEffect, useSyncExternalStore } from "react";
import { readStoredBrief, subscribeStoredBrief, clearStoredBrief } from "@/lib/brief-storage";
import { submitInquiry, type InquiryState } from "@/server/inquiries/submit";
import { MetaLabel, Rule } from "@/components/site/primitives";
import type { PublicBrief } from "@/domain/workflow/public-brief";

const initial: InquiryState = { ok: false };

function Field({
  name,
  label,
  error,
  textarea = false,
  type = "text",
  required = false,
  defaultValue = "",
  autoComplete,
}: {
  name: string;
  label: string;
  error?: string;
  textarea?: boolean;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
}) {
  const errorId = `${name}-error`;
  const cls = `site-field ${error ? "site-field-error" : ""}`;
  const describedBy = error ? errorId : undefined;
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/60">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          className={`${cls} mt-2`}
          required={required}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={`${cls} mt-2`}
          required={required}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      )}
      {error ? (
        <span id={errorId} className="mt-2 block text-xs text-[#8a1f1f]" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function IntakeForm() {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const brief = useSyncExternalStore(
    subscribeStoredBrief,
    readStoredBrief,
    (): PublicBrief | null => null,
  );
  const toolList =
    brief?.draft.systems.filter(Boolean).join(" · ") ||
    brief?.requiredConnections.join(" · ") ||
    "";
  const connectionList = brief?.requiredConnections.join(" · ") ?? "";
  const integrationsPrefill =
    connectionList && connectionList !== toolList ? connectionList : "";

  useEffect(() => {
    if (state.ok) {
      clearStoredBrief();
      if (state.mailto) {
        window.location.href = state.mailto;
      }
    }
  }, [state.ok, state.mailto]);

  if (state.ok) {
    return (
      <div className="max-w-xl border-t border-synas-ink/12 py-14">
        <MetaLabel>Sent from your side</MetaLabel>
        <h2 className="mt-4 font-serif text-3xl font-normal tracking-tight">
          The note is ready for hello@synaslabs.com.
        </h2>
        <p className="mt-5 text-[1.02rem] leading-relaxed text-synas-ink/75">
          {state.stored
            ? "It is also recorded in our system."
            : "Your email client should open with the project note. If it did not, use the address below."}
        </p>
        {state.mailto ? (
          <p className="mt-8">
            <a href={state.mailto} className="site-action">
              Open email to hello@synaslabs.com →
            </a>
          </p>
        ) : (
          <p className="mt-8">
            <a href="mailto:hello@synaslabs.com" className="site-action lowercase">
              hello@synaslabs.com
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form key={brief ? "attached" : "plain"} action={action} className="border-t border-synas-ink/12 pb-20">
      {brief ? (
        <div className="border-b border-synas-ink/12 py-8">
          <MetaLabel>System brief attached</MetaLabel>
          <p className="mt-3 font-serif text-xl font-normal tracking-tight">
            We already have a starting point.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-synas-ink/70">
            {brief.draft.processName}. You can still edit the process below.
          </p>
          <input type="hidden" name="briefJson" value={JSON.stringify(brief)} />
        </div>
      ) : (
        <p className="py-8 text-sm text-synas-ink/65">
          No system brief attached. That is fine — start from the work itself.
        </p>
      )}

      <fieldset className="py-10">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
          01 Business
        </legend>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Field
            name="businessName"
            label="Business"
            required
            autoComplete="organization"
            error={state.errors?.businessName}
          />
          <Field
            name="website"
            label="Website"
            autoComplete="url"
            error={state.errors?.website}
          />
        </div>
      </fieldset>
      <Rule />
      <fieldset className="py-10">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
          02 Contact
        </legend>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Field
            name="contactName"
            label="Your name"
            required
            autoComplete="name"
            error={state.errors?.contactName}
          />
          <Field
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            error={state.errors?.email}
          />
          <Field
            name="role"
            label="Role"
            autoComplete="organization-title"
            error={state.errors?.role}
          />
        </div>
      </fieldset>
      <Rule />
      <fieldset className="py-10">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
          03 How work moves
        </legend>
        <div className="mt-8 flex flex-col gap-8">
          <Field
            name="currentProcess"
            label="Current process"
            textarea
            required
            defaultValue={brief?.narrative ?? ""}
            error={state.errors?.currentProcess}
          />
          <Field
            name="painPoints"
            label="Where it hurts"
            textarea
            required
            defaultValue={brief?.exceptions || brief?.workflow.currentPain || ""}
            error={state.errors?.painPoints}
          />
          <Field
            name="tools"
            label="Tools in use"
            defaultValue={toolList}
            error={state.errors?.tools}
          />
          <Field
            name="manualWork"
            label="What is still done by hand"
            textarea
            defaultValue={brief?.humanSteps.join(" · ") ?? ""}
            error={state.errors?.manualWork}
          />
        </div>
      </fieldset>
      <Rule />
      <fieldset className="py-10">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
          04 What should change
        </legend>
        <div className="mt-8 flex flex-col gap-8">
          <Field
            name="desiredOutcome"
            label="Desired outcome"
            textarea
            required
            error={state.errors?.desiredOutcome}
          />
          <Field
            name="integrations"
            label="Integrations"
            defaultValue={integrationsPrefill}
            error={state.errors?.integrations}
          />
          <div className="grid gap-8 md:grid-cols-2">
            <Field name="timeline" label="Timeline" error={state.errors?.timeline} />
            <Field name="budget" label="Budget, if you have a range" error={state.errors?.budget} />
          </div>
          <Field
            name="requirements"
            label="Anything else we should know"
            textarea
            error={state.errors?.requirements}
          />
        </div>
      </fieldset>

      <div hidden aria-hidden="true">
        <label>
          Company website
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.errors?.form ? (
        <p className="pb-6 text-sm text-[#8a1f1f]" role="alert">
          {state.errors.form}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="site-action text-base">
        {pending ? "Preparing…" : "Send project note →"}
      </button>
    </form>
  );
}
