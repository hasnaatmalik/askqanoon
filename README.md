# AskQanoon: Pakistani Law AI Assistant

**AskQanoon** is an advanced AI-powered legal assistant designed to make Pakistani laws accessible to everyone. Featuring a beautiful, distraction-free "Warm Paper" design language, it uses **Retrieval-Augmented Generation (RAG)** with **HyDE (Hypothetical Document Embeddings)** to provide accurate, grounded answers from legal texts like the Pakistan Penal Code (PPC), CrPC, and Constitution.

## 🚀 Key Features

### 1. Minimalist "Warm Paper" Interface
- **Distraction-Free**: A highly polished, flat aesthetic designed to look and feel like warm legal paper, prioritizing readability.
- **Floating Input**: A premium, responsive chat interface that elegantly handles both English and Roman Urdu.

### 2. Ask AI (RAG Chat)
- **Accurate Answers**: Retrieves precise legal sections from a Pinecone vector database using advanced HyDE techniques.
- **Citations**: Every answer cites the specific law and section number via beautiful, dedicated statute cards.
- **Graceful Degradation**: Chat works even if the vector database is unavailable, cleanly communicating to the user when citations are missing.

### 3. Settlement Negotiation AI
- **Case Analyzer**: Input case facts and opponent history to get a strategic analysis.
- **Win Probability**: AI estimates the likelihood of success in court via visual progress bars.
- **Settlement Range**: Calculates Low, Ideal, and High settlement figures.
- **Email Drafter**: Auto-generates settlement offer emails with adjustable tones (Aggressive, Balanced, Conciliatory).

### 4. Compliance Matrix Agent

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Chat Model**: **Groq (Llama 3.3 70B or GPT-OSS)** for ultra-fast, high-quality reasoning.
- **Vector DB**: Pinecone (Serverless)
- **Embeddings**: `gemini-embedding-001` (3072 Dimensions via Google AI)

---

## 🧠 How an Answer Is Made

```
question ──► rewrite + HyDE (small model, 1 call) ──► 3 probes ──► rank fusion ──► top 6 chunks
                                                                                      │
 UI ◄── verify citations in code ◄── answer + FOLLOW_UPS (main model, tagged <source> context)
```

| Step | Technique | Why |
|---|---|---|
| 1. Rewrite | One JSON call turns the question + chat history into a **standalone English question** and a **HyDE passage** (a hypothetical statute paragraph). Roman Urdu is translated for retrieval. | Follow-ups like *"and for non-bailable ones?"* now retrieve the right law; Urdu queries match English statute text. |
| 2. Retrieve | Pinecone is searched with the HyDE passage, the standalone question and the raw words; results are merged with **reciprocal-rank fusion**. | Chunks found by several probes rise to the top; one bad probe can't sink retrieval. |
| 3. Generate | Scope-aware system prompt, `<source id="S1" law=… section=…>` tagged context, two **few-shot examples** (a cited answer and an honest refusal), safety-first rule (Police 15 / Rescue 1122 / Women's helpline 1043), **answer-then-ask** clarification. | Grounded, consistent format; refuses cleanly outside the database instead of guessing. |
| 4. Verify | Code (not the model) removes `[S#]` tags that match no source, **shows only the sources actually cited**, and renumbers them so chips and cards always line up. | The old version showed all 8 retrieved chunks even when the answer used one. |
| 5. Suggest | The model ends with `FOLLOW_UPS:` (3 questions the database can answer); the UI renders them as tap targets. | Users who don't know what to ask can keep going. |

Prompts live in [src/lib/prompts.ts](src/lib/prompts.ts), citation handling in [src/lib/citations.ts](src/lib/citations.ts).

**Safety and honesty**
- Question size is validated and only the last six valid turns are kept.
- If the sources don't support an answer the UI shows a "couldn't verify" notice with no source cards. This is decided by *whether any valid citation survived*, not by matching phrases in the text.
- Retrieved text and chat history are treated as data; the prompt tells the model to ignore instructions inside them.
- Roman Urdu mode must stay in Latin letters; law names and section numbers stay in English.

---

## 🖥️ UI at a Glance

- **One-tap start**: situation tabs (Police & FIR, Rent, Work, Family, Online, Shopping, Women & rights) with questions the library can answer, in English or Roman Urdu. Landing-page suggestions ask immediately.
- **Clickable citations**: `[S1]` chips in the text jump to and highlight the source card.
- **Follow-up chips**, **Copy**, **Regenerate**, retry on error, and a live status line while waiting ("Searching the statute books…").
- **Always-visible emergency numbers** (Police 15, Rescue 1122) and a "legal information, not advice" notice.
- Auto-growing input, Enter to send / Shift+Enter for a new line, voice input, mobile-first layout, same Warm Paper colours and Outfit / Public Sans typography.

---

## 📏 Evaluation

A golden set of **44 cases** ([evals/golden.json](evals/golden.json)) covers criminal, tenancy, labour, family, cyber, consumer, women's protection and constitutional rights, plus Roman Urdu, multi-turn, safety, out-of-scope and adversarial prompts (prompt injection, "will I win?", evidence-hiding). All checks are deterministic, so runs are cheap and comparable between prompt changes.

```bash
npm run eval                          # all cases (needs GROQ / GOOGLE / PINECONE keys in .env)
npm run eval -- --limit 10            # quick smoke test
npm run eval -- --category tenancy    # one category
npm run eval -- --write-readme        # refresh the table below
npm test                              # unit tests for citation parsing and prompt builders (no keys needed)
```

| Metric | Definition | Target |
|---|---|---|
| Case pass rate | All checks for a case pass | ≥ 85% |
| Source accuracy | A cited source comes from the expected law (e.g. Rent and Tenancy for a landlord question) | ≥ 90% |
| Key-fact recall | Share of required facts present (e.g. "30 days", "12 weeks", "Section 154") | ≥ 85% |
| Claim citation rate | Fact-bearing sentences (numbers, sections, "must/cannot") that carry an `[S#]` tag | ≥ 90% |
| Correct abstention | Out-of-scope questions answered with no sources and a refusal | 100% |
| Over-abstention | In-scope questions wrongly refused | ≤ 5% |
| Forbidden claims | Answer contains a trap phrase (guaranteed win, "302 is theft") | 0% |
| Roman Urdu script | Roman Urdu answers contain no Arabic-script characters | 100% |
| Follow-ups offered | ≥ 2 usable suggested questions | ≥ 90% |
| Latency | p50 / p95 end to end | p95 < 12 s |

### Latest results

<!-- EVAL:START -->
_Not run yet. Add your keys to `.env` and run `npm run eval -- --write-readme` to fill this table._
<!-- EVAL:END -->

Per-case output (answers, failures) is written to `evals/results/latest.json`. The unit tests are the only checks that run without API keys. They cover citation verification and renumbering, follow-up parsing, script detection and prompt assembly.

**Known limits**: the library is small (about 14 core PPC/CrPC sections plus practical guides for tenancy, labour, consumer, family and cyber law), so coverage questions legitimately return "not covered". Facts such as minimum wage and rent-increase caps come from the ingested text and should be re-checked against current law when the data is refreshed.

---

## 🛠️ Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/hasnaatmalik/askqanoon.git
cd askqanoon
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
# Groq API (Required for LLM chat — fast, free at console.groq.com)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Google Gemini API (Required for EMBEDDINGS ONLY — vector retrieval from Pinecone)
# Get from aistudio.google.com - must start with AQ. or AIza
GOOGLE_API_KEY=your_google_api_key

# Pinecone (Required for RAG)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=askqanoon
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🌍 Deployment (Vercel)

This project is optimized for [Vercel](https://vercel.com).

1.  Push your code to GitHub.
2.  Go to **Vercel** -> **New Project**.
3.  Import the `askqanoon` repository.
4.  **Important**: Add all API keys from your `.env` to the Vercel **Environment Variables** settings.
5.  Click **Deploy!**.

---

## ⚖️ Disclaimer
AskQanoon provides legal *information*, not legal *advice*. AI responses can contain errors. Always consult a qualified attorney for professional legal counsel.
