import type { WorkflowV1 } from "./schema";

/** Test/dev fixture only. Never present this as a client case or the only public demo. */
export const missedCallDispatchWorkflow: WorkflowV1 = {
  version: 1,
  id: "wf_missed_call_dispatch_v1",
  name: "Missed call to dispatch",
  industry: "field service",
  inScope: true,
  currentPain:
    "Calls land in a shared mobile, voicemails pile up, and jobs are written into a spreadsheet after the fact.",
  inputs: ["Missed call", "Voicemail"],
  actors: [
    { name: "Voice intake", kind: "system" },
    { name: "Duty coordinator", kind: "human" },
  ],
  systems: [
    { name: "Voice intake", status: "known" },
    { name: "CRM", status: "known" },
    { name: "Calendar", status: "known" },
    { name: "Inbox", status: "known" },
  ],
  steps: [
    {
      id: "intake",
      title: "Capture the call",
      actor: "system",
      systemName: "Voice intake",
      action: "Record the missed call and transcribe the voicemail.",
      output: "A structured enquiry exists.",
    },
    {
      id: "qualify",
      title: "Qualify the job",
      actor: "mixed",
      systemName: "CRM",
      action: "Score urgency from the transcript; a coordinator confirms edge cases.",
      output: "A job card with priority.",
    },
    {
      id: "schedule",
      title: "Place on the board",
      actor: "system",
      systemName: "Calendar",
      action: "Offer the next two windows that match skills and postcode.",
      output: "A hold on the calendar.",
    },
    {
      id: "confirm",
      title: "Confirm with the customer",
      actor: "human",
      systemName: "Inbox",
      action: "Coordinator sends the window and waits for a yes.",
      output: "A confirmed appointment.",
    },
  ],
  decisions: [
    {
      id: "decision_qualify",
      atStepId: "qualify",
      question: "Is this an emergency that the board can take?",
      owner: "Duty coordinator",
    },
  ],
  exception: {
    id: "ex_no_capacity",
    atStepId: "schedule",
    title: "No skilled window today",
    description:
      "The calendar has no matching engineer inside the promised response time.",
    humanOwner: "Duty coordinator",
    systemCanDetect: true,
    systemCanResolve: false,
  },
  outputs: ["A confirmed appointment"],
  openQuestions: ["Which parts of qualification should stay human?"],
  sampleCase: {
    id: "case_fictional_northside",
    title: "Burst pipe, Northside (fictional)",
    summary:
      "A property manager leaves a voicemail at 07:12 about water in a ground-floor corridor.",
    fictional: true,
    facts: {
      caller: "A. Rahman (fictional)",
      site: "14 Harbour Row (fictional)",
      promise: "Same-day emergency",
    },
  },
};

export const outOfScopeWorkflow: WorkflowV1 = {
  version: 1,
  id: "wf_out_of_scope_v1",
  name: "Unspecified process",
  inScope: false,
  outOfScopeReason:
    "The description is not a business process Synas can represent as a connected system yet.",
  currentPain: "Unknown",
  inputs: [],
  actors: [{ name: "UNKNOWN", kind: "unknown" }],
  systems: [{ name: "UNKNOWN", status: "UNKNOWN" }],
  steps: [
    {
      id: "unknown",
      title: "Unknown",
      actor: "human",
      action: "Hold. Do not invent a workflow.",
    },
  ],
  decisions: [],
  exception: {
    id: "ex_none",
    atStepId: "unknown",
    title: "None",
    description: "No simulation.",
    humanOwner: "Synas",
    systemCanDetect: false,
    systemCanResolve: false,
  },
  outputs: [],
  openQuestions: ["What actually happens, in order, from the first request to done?"],
  sampleCase: {
    id: "case_none",
    title: "None",
    summary: "No fictional case is generated for out-of-scope input.",
    fictional: true,
    facts: {},
  },
};
