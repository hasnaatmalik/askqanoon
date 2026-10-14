/**
 * AskQanoon evaluation harness.
 *
 *   npm run eval                       run every case in evals/golden.json
 *   npm run eval -- --limit 10         first 10 cases (cheap smoke test)
 *   npm run eval -- --category rent    only one category
 *   npm run eval -- --delay 1500       ms between cases (respect Groq rate limits)
 *   npm run eval -- --write-readme     write the results table into README.md
 *
 * Needs GROQ_API_KEY, GOOGLE_API_KEY, PINECONE_API_KEY, PINECONE_INDEX in .env.
 * All metrics are deterministic (regex / structure checks), so runs are cheap and comparable.
 */
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { containsArabicScript } from "../src/lib/citations";
import type { ChatResult, ChatTurn } from "../src/lib/chat";

dotenv.config();

interface Case {
    id: string;
    category: string;
    lang: "en" | "ur";
    question: string;
    inScope: boolean;
    expectedLaw?: string;
    mustInclude?: string[];
    mustNotInclude?: string[];
    history?: ChatTurn[];
}

interface CaseResult {
    id: string;
    category: string;
    ms: number;
    grounded: boolean;
    sourceHit: boolean | null;
    factRecall: number | null;
    forbiddenHit: boolean;
    claimCitationRate: number | null;
    languageOk: boolean | null;
    followUpsOk: boolean;
    abstainedCorrectly: boolean | null;
    pass: boolean;
    failures: string[];
    answer: string;
}

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const value = (name: string) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
};

/** Sentences that state a checkable fact: contain a number, "Section", or a legal modal. */
function claimSentences(answer: string): string[] {
    return answer
        .replace(/^#+\s.*$/gm, "")
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20)
        .filter((s) => /\d|section|article|illegal|must|cannot|entitled|required|right to/i.test(s));
}

function percentile(values: number[], p: number) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

const pct = (n: number, d: number) => (d === 0 ? "n/a" : `${((n / d) * 100).toFixed(1)}%`);
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function score(c: Case, r: ChatResult, ms: number): CaseResult {
    const failures: string[] = [];
    const abstainExpected = c.category === "out-of-scope";

    const sourceHit =
        c.expectedLaw && !abstainExpected
            ? r.sources.some((s) => s.law.toUpperCase().includes(c.expectedLaw!.toUpperCase()))
            : null;
    if (sourceHit === false) failures.push(`no cited source from "${c.expectedLaw}"`);

    let factRecall: number | null = null;
    if (c.mustInclude?.length) {
        const hits = c.mustInclude.filter((re) => new RegExp(re, "i").test(r.answer));
        factRecall = hits.length / c.mustInclude.length;
        for (const re of c.mustInclude) if (!hits.includes(re)) failures.push(`missing /${re}/`);
    }

    const forbidden = (c.mustNotInclude ?? []).filter((re) => new RegExp(re, "i").test(r.answer));
    for (const re of forbidden) failures.push(`forbidden /${re}/ present`);

    let claimCitationRate: number | null = null;
    if (!abstainExpected && r.grounded) {
        const claims = claimSentences(r.answer);
        if (claims.length > 0) {
            // A claim counts as cited if its sentence, or the line it sits on, carries an [S#] tag.
            const lines = r.answer.split("\n");
            const cited = claims.filter((s) => /\[S\d+\]/.test(s) || lines.some((l) => l.includes(s) && /\[S\d+\]/.test(l)));
            claimCitationRate = cited.length / claims.length;
        }
    }

    const languageOk = c.lang === "ur" ? !containsArabicScript(r.answer) : null;
    if (languageOk === false) failures.push("Arabic script in Roman Urdu answer");

    const followUpsOk = r.followUps.length >= 2;

    let abstainedCorrectly: boolean | null = null;
    if (abstainExpected) {
        abstainedCorrectly = !r.grounded && r.sources.length === 0;
        if (!abstainedCorrectly) failures.push("answered an out-of-scope question with citations");
    } else if (c.inScope && !r.grounded) {
        failures.push("abstained on an in-scope question");
    }

    return {
        id: c.id,
        category: c.category,
        ms,
        grounded: r.grounded,
        sourceHit,
        factRecall,
        forbiddenHit: forbidden.length > 0,
        claimCitationRate,
        languageOk,
        followUpsOk,
        abstainedCorrectly,
        pass: failures.length === 0,
        failures,
        answer: r.answer,
    };
}

function summarize(results: CaseResult[]) {
    const inScope = results.filter((r) => r.category !== "out-of-scope" && r.sourceHit !== null);
    const oos = results.filter((r) => r.category === "out-of-scope");
    const ur = results.filter((r) => r.languageOk !== null);
    const recalls = results.map((r) => r.factRecall).filter((x): x is number => x !== null);
    const cites = results.map((r) => r.claimCitationRate).filter((x): x is number => x !== null);
    const times = results.map((r) => r.ms);

    return [
        ["Case pass rate", pct(results.filter((r) => r.pass).length, results.length), "≥ 85%"],
        ["Source accuracy (cited the right law)", pct(inScope.filter((r) => r.sourceHit).length, inScope.length), "≥ 90%"],
        ["Key-fact recall", `${(avg(recalls) * 100).toFixed(1)}%`, "≥ 85%"],
        ["Claim citation rate", `${(avg(cites) * 100).toFixed(1)}%`, "≥ 90%"],
        ["Correct abstention (out of scope)", pct(oos.filter((r) => r.abstainedCorrectly).length, oos.length), "100%"],
        ["Over-abstention (in-scope refused)", pct(inScope.filter((r) => !r.grounded).length, inScope.length), "≤ 5%"],
        ["Forbidden / hallucinated claims", pct(results.filter((r) => r.forbiddenHit).length, results.length), "0%"],
        ["Roman Urdu stays in Latin script", pct(ur.filter((r) => r.languageOk).length, ur.length), "100%"],
        ["Follow-up questions offered", pct(results.filter((r) => r.followUpsOk).length, results.length), "≥ 90%"],
        ["Latency p50 / p95", `${(percentile(times, 50) / 1000).toFixed(1)}s / ${(percentile(times, 95) / 1000).toFixed(1)}s`, "p95 < 12s"],
    ];
}

function toMarkdown(rows: string[][], n: number, model: string) {
    const date = new Date().toISOString().slice(0, 10);
    return [
        `_Last run: ${date} · ${n} cases · model \`${model}\`_`,
        "",
        "| Metric | Result | Target |",
        "|---|---|---|",
        ...rows.map(([a, b, c]) => `| ${a} | **${b}** | ${c} |`),
    ].join("\n");
}

async function main() {
    const { ragService } = await import("../src/services/rag/rag.service");
    let cases: Case[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "evals/golden.json"), "utf8"));
    const category = value("category");
    if (category) cases = cases.filter((c) => c.category === category);
    const limit = Number(value("limit"));
    if (limit > 0) cases = cases.slice(0, limit);
    const delay = Number(value("delay") ?? 800);
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    console.log(`Running ${cases.length} cases against ${model}…\n`);
    const results: CaseResult[] = [];
    for (const c of cases) {
        const start = Date.now();
        const out = await ragService.query(c.question, c.history ?? [], c.lang === "ur");
        const r = score(c, out, Date.now() - start);
        results.push(r);
        console.log(`${r.pass ? "✓" : "✗"} ${c.id.padEnd(20)} ${(r.ms / 1000).toFixed(1)}s ${r.failures.join("; ")}`);
        if (delay > 0) await new Promise((res) => setTimeout(res, delay));
    }

    const rows = summarize(results);
    const md = toMarkdown(rows, results.length, model);
    console.log(`\n${md}\n`);

    fs.mkdirSync("evals/results", { recursive: true });
    fs.writeFileSync("evals/results/latest.json", JSON.stringify({ model, summary: rows, results }, null, 2));
    console.log("Full per-case output: evals/results/latest.json");

    if (flag("write-readme")) {
        const readme = fs.readFileSync("README.md", "utf8");
        const block = `<!-- EVAL:START -->\n${md}\n<!-- EVAL:END -->`;
        fs.writeFileSync("README.md", readme.replace(/<!-- EVAL:START -->[\s\S]*?<!-- EVAL:END -->/, block));
        console.log("README.md updated.");
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
