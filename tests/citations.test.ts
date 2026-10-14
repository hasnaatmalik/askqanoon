import { test } from "node:test";
import assert from "node:assert/strict";
import { containsArabicScript, finalizeAnswer, splitFollowUps } from "../src/lib/citations";
import { buildSystemPrompt, buildUserMessage, formatSources } from "../src/lib/prompts";
import type { LegalSource } from "../src/lib/chat";

const src = (id: number, law = `Law ${id}`): LegalSource => ({ id, law, section: String(id), excerpt: `excerpt ${id}` });
const retrieved = [src(1), src(2), src(3), src(4)];

test("keeps only cited sources and renumbers them in order of first citation", () => {
  const out = finalizeAnswer("Rent rises 10%. [S3] Eviction needs notice. [S1]", retrieved);
  assert.equal(out.answer, "Rent rises 10%. [S1] Eviction needs notice. [S2]");
  assert.deepEqual(out.sources.map((s) => [s.id, s.law]), [[1, "Law 3"], [2, "Law 1"]]);
});

test("strips citation tags that match no retrieved source", () => {
  const out = finalizeAnswer("A fact. [S9] Another. [S2]", retrieved);
  assert.equal(out.invalidCitations, 1);
  assert.equal(out.answer, "A fact. Another. [S1]");
  assert.equal(out.sources.length, 1);
});

test("expands grouped tags like [S1, S3]", () => {
  const out = finalizeAnswer("Both apply. [S1, S3]", retrieved);
  assert.equal(out.answer, "Both apply. [S1][S2]");
  assert.deepEqual(out.sources.map((s) => s.law), ["Law 1", "Law 3"]);
});

test("an answer with no citations has no sources (ungrounded)", () => {
  const out = finalizeAnswer("I can't answer that from my database.", retrieved);
  assert.equal(out.sources.length, 0);
});

test("splits the FOLLOW_UPS block off the answer", () => {
  const raw = "Answer. [S1]\n\nFOLLOW_UPS:\n- What is bail?\n- 2. How do I file an FIR?\n- \"Can police refuse?\"\n- extra question four here";
  const { body, followUps } = splitFollowUps(raw);
  assert.equal(body, "Answer. [S1]");
  assert.deepEqual(followUps, ["What is bail?", "How do I file an FIR?", "Can police refuse?"]);
});

test("tolerates bold FOLLOW-UPS heading and missing block", () => {
  assert.deepEqual(splitFollowUps("Hi\n**FOLLOW_UPS:**\n- Is rent capped yearly?").followUps, ["Is rent capped yearly?"]);
  assert.deepEqual(splitFollowUps("Just an answer").followUps, []);
});

test("detects Arabic-script characters", () => {
  assert.equal(containsArabicScript("Aap FIR darj karwa sakte hain"), false);
  assert.equal(containsArabicScript("آپ FIR درج"), true);
});

test("prompt builders: language switch, tagged sources, offline notice", () => {
  assert.match(buildSystemPrompt(true), /Roman Urdu/);
  assert.doesNotMatch(buildSystemPrompt(false), /Never use Urdu\/Arabic script/);
  const block = formatSources([{ ...src(1), law: 'Rent "Act"' }], ["text"]);
  assert.match(block, /<source id="S1" law="Rent 'Act'" section="1">/);
  const msg = buildUserMessage({ question: "q", standaloneQuestion: "q2", history: "", sourcesBlock: block, ragConfigured: false });
  assert.match(msg, /database is offline/);
  assert.match(msg, /Understood as: q2/);
});
