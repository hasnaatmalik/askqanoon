import type { LegalSource } from "@/lib/chat";

const MAX_FOLLOW_UPS = 3;
const FOLLOW_UP_MARKER = /\n?\s*(?:\*\*)?FOLLOW[_ -]?UPS?\s*:?\s*(?:\*\*)?\s*\n/i;

/** Expand grouped tags like [S1, S3] into [S1][S3] so every tag has one id. */
function normalizeTags(text: string): string {
  return text.replace(/\[\s*S(\d+(?:\s*[,;&]\s*S?\d+)+)\s*\]/gi, (_, group: string) =>
    group
      .split(/\s*[,;&]\s*/)
      .map((n) => `[S${n.replace(/^S/i, "")}]`)
      .join("")
  );
}

/** Split off the trailing "FOLLOW_UPS:" list the prompt asks for. */
export function splitFollowUps(raw: string): { body: string; followUps: string[] } {
  const match = FOLLOW_UP_MARKER.exec(raw);
  if (!match) return { body: raw.trim(), followUps: [] };

  const body = raw.slice(0, match.index).trim();
  const followUps = raw
    .slice(match.index + match[0].length)
    .split("\n")
    .map((line) => line.replace(/^\s*(?:(?:[-*•]|\d+[.)])\s*)+/, "").replace(/^["“]|["”]$/g, "").trim())
    .filter((line) => line.length > 5 && line.length <= 140)
    .slice(0, MAX_FOLLOW_UPS);

  return { body, followUps };
}

export interface FinalizedAnswer {
  answer: string;
  sources: LegalSource[];
  followUps: string[];
  /** Citation tags the model emitted that point at no retrieved source. */
  invalidCitations: number;
}

/**
 * Turns the raw model output into what the UI shows:
 *  - drops the FOLLOW_UPS block
 *  - removes citation tags that don't match a retrieved source
 *  - keeps only the sources that are actually cited
 *  - renumbers them S1..Sn in order of first citation, so the chips in the text
 *    and the cards below always line up
 */
export function finalizeAnswer(raw: string, retrieved: LegalSource[]): FinalizedAnswer {
  const { body, followUps } = splitFollowUps(raw);
  const text = normalizeTags(body);

  const byId = new Map(retrieved.map((s) => [s.id, s]));
  const order: number[] = [];
  let invalidCitations = 0;

  for (const m of text.matchAll(/\[S(\d+)\]/gi)) {
    const id = Number(m[1]);
    if (!byId.has(id)) invalidCitations++;
    else if (!order.includes(id)) order.push(id);
  }

  const renumber = new Map(order.map((oldId, i) => [oldId, i + 1]));
  const answer = text
    .replace(/\[S(\d+)\]/gi, (_, n: string) => {
      const next = renumber.get(Number(n));
      return next ? `[S${next}]` : "";
    })
    .replace(/[ \t]+([.,;:])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  const sources = order.map((oldId) => ({ ...byId.get(oldId)!, id: renumber.get(oldId)! }));
  return { answer, sources, followUps, invalidCitations };
}

/** Detects Arabic-script characters (used to verify Roman Urdu mode stays in Latin letters). */
export function containsArabicScript(text: string): boolean {
  return /[؀-ۿݐ-ݿ]/.test(text);
}
