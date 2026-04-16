export type ConversionHistoryItem = {
  id: string;
  toolId: string;
  toolSlug: string;
  toolName: string;
  fileName: string;
  status: "completed" | "failed";
  createdAt: number;
  uploadUrl?: string | null;
  expiresAt?: number | null;
};

export const HISTORY_RETENTION_MINUTES = 30;
export const HISTORY_RETENTION_MS = HISTORY_RETENTION_MINUTES * 60 * 1000;
