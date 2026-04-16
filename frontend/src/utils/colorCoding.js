export const COLOR_CODES = {
  suspicious: {
    color: "#ef4444",
    label: "Suspicious",
    description: "This email may be harmful",
  },
  important: {
    color: "#22c55e",
    label: "Important",
    description: "High priority email",
  },
  sponsor: {
    color: "#f59e0b",
    label: "Sponsored",
    description: "Promotional or advertisement email",
  },
  job: {
    color: "#6366f1",
    label: "Career",
    description: "Job or career related email",
  },
  normal: {
    color: "#94a3b8",
    label: "Normal",
    description: "Standard email",
  },
};

export function getEmailColorCode(scanResult) {
  if (!scanResult) return COLOR_CODES.normal;
  if (scanResult.is_suspicious) return COLOR_CODES.suspicious;
  if (scanResult.is_important) return COLOR_CODES.important;
  if (scanResult.is_job) return COLOR_CODES.job;
  if (scanResult.is_sponsor) return COLOR_CODES.sponsor;
  return COLOR_CODES.normal;
}