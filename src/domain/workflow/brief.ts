import type { SimulationResult } from "./simulator";
import type { WorkflowV1 } from "./schema";

export type SystemBriefDraft = {
  title: string;
  processName: string;
  inScope: boolean;
  currentPain: string;
  automatedSteps: string[];
  humanSteps: string[];
  mixedSteps: string[];
  systems: string[];
  exception: {
    title: string;
    humanOwner: string;
    systemCanDetect: boolean;
    systemCanResolve: boolean;
  } | null;
  sampleCaseTitle: string;
  recommendedConversation: string;
  eventCount: number;
};

export function deriveSystemBrief(
  workflow: WorkflowV1,
  result: SimulationResult,
): SystemBriefDraft {
  const systems = [
    ...new Set(
      workflow.steps
        .map((step) => step.systemName)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  if (!workflow.inScope) {
    return {
      title: `Out of scope — ${workflow.name}`,
      processName: workflow.name,
      inScope: false,
      currentPain: workflow.currentPain,
      automatedSteps: [],
      humanSteps: [],
      mixedSteps: [],
      systems,
      exception: null,
      sampleCaseTitle: workflow.sampleCase.title,
      recommendedConversation:
        "This process should not be simulated. The next step is a conversation about what is actually going on.",
      eventCount: result.events.length,
    };
  }

  return {
    title: `System brief — ${workflow.name}`,
    processName: workflow.name,
    inScope: true,
    currentPain: workflow.currentPain,
    automatedSteps: workflow.steps
      .filter((step) => step.actor === "system")
      .map((step) => step.title),
    humanSteps: workflow.steps
      .filter((step) => step.actor === "human")
      .map((step) => step.title),
    mixedSteps: workflow.steps
      .filter((step) => step.actor === "mixed")
      .map((step) => step.title),
    systems,
    exception: {
      title: workflow.exception.title,
      humanOwner: workflow.exception.humanOwner,
      systemCanDetect: workflow.exception.systemCanDetect,
      systemCanResolve: workflow.exception.systemCanResolve,
    },
    sampleCaseTitle: workflow.sampleCase.title,
    recommendedConversation:
      "Walk through this brief, confirm what should stay human, then start a project if the system is worth building.",
    eventCount: result.events.length,
  };
}
