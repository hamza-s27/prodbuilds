import type { PrivacyFact } from "./types";

export const privacyFacts: readonly PrivacyFact[] = [
  { value: "0", label: "Advertising or tracking cookies on this site" },
  { value: "Never", label: "Do we sell client data, share it for advertising, or use it to train models" },
  { value: "30", unit: "days", label: "At most, to delete client data after an agreement ends" },
];
