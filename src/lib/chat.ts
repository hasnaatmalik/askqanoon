export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface LegalSource {
  /** Display number, matching the [S#] tags in the answer text. */
  id: number;
  law: string;
  section: string;
  excerpt: string;
}

export interface ChatResult {
  answer: string;
  /** Only the sources the answer actually cites, numbered in order of first citation. */
  sources: LegalSource[];
  /** Suggested next questions the user can tap. */
  followUps: string[];
  /** True when the answer is backed by at least one valid citation. */
  grounded: boolean;
}

export function isChatTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") return false;
  const turn = value as Record<string, unknown>;
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string" &&
    turn.content.trim().length > 0
  );
}
