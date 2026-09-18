export const CHANNELS = [
  "whatsapp",
  "phone",
  "email",
  "form",
  "in-person",
  "other",
] as const;

export type Channel = (typeof CHANNELS)[number];

export type Starter = {
  id: string;
  label: string;
  narrative: string;
};

export const STARTERS: readonly Starter[] = [
  {
    id: "whatsapp-orders",
    label: "WhatsApp orders",
    narrative:
      "Customers send orders on WhatsApp. Someone checks the payment screenshot. If the address is missing they ask for it. Then the order is typed into a spreadsheet and shipping is arranged.",
  },
  {
    id: "missed-calls",
    label: "Missed calls",
    narrative:
      "Calls come in on a shared mobile. Missed calls become voicemails. Someone listens later, writes the job in a notebook, then calls back and tries to book a slot.",
  },
  {
    id: "lead-followup",
    label: "Lead follow-up",
    narrative:
      "Enquiries arrive from a website form and Instagram DMs. They sit in an inbox. Someone copies them into a sheet. Follow-up is often forgotten, and a late message goes out.",
  },
];
