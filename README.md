# AskQanoon: Pakistani Law AI Assistant

**AskQanoon** is an advanced AI-powered legal assistant designed to make Pakistani laws accessible to everyone. It uses **Retrieval-Augmented Generation (RAG)** to provide accurate, grounded answers from legal texts like the Pakistan Penal Code (PPC), CrPC, and Constitution.

## 🚀 Key Features

### 1. Ask AI (RAG Chat)
- **Accurate Answers**: Retrieves precise legal sections from a Pinecone vector database.
- **Bilingual Support**: Ask and receive answers in **English** or **Roman Urdu**.
- **Citations**: Every answer cites the specific law and section number (e.g., *PPC Section 302*).
- **Voice Mode**: Speak your questions naturally (UI integrated).

### 2. Compliance Matrix Agent
- **Multi-Jurisdiction Analysis**: Compare regulations across Pakistan, EU (GDPR), California (CCPA), and USA Federal.
- **Conflict Detection**: Automatically identifies conflicting requirements (e.g., Data Retention restrictions).
- **Visual Matrix**: Easy-to-read table showing compliance status (Compliant, Stricter, Lax).

### 3. Settlement Negotiation AI
- **Case Analyzer**: Input case facts and opponent history to get a strategic analysis.
- **Win Probability**: AI estimates the likelihood of success in court.
- **Settlement Range**: Calculates Low, Ideal, and High settlement figures.
- **Email Drafter**: Auto-generates settlement offer emails with adjustable tones (Aggressive, Balanced, Conciliatory).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **AI Model**: **Google Gemini 2.5 Flash** (Free Tier Optimized)
- **Vector DB**: Pinecone (Serverless)
- **Embeddings**: `gemini-embedding-001` (3072 Dimensions)
- **Orchestration**: LangChain.js

---

## Answer quality and safety

The chat path is intentionally grounded:

- The API validates question size and preserves only the last six valid chat turns.
- Retrieval is performed from Pinecone before generation. The model is told to treat retrieved text as data, not instructions.
- Every legal claim must cite its retrieved source tag (`[S1]`, `[S2]`); the matching source cards are shown below the response.
- When the database cannot support an answer, AskQanoon says so instead of creating a demonstration answer.
- Roman Urdu mode requires Latin-script Urdu output; the legal source names and section numbers remain unchanged.

For production, monitor answer/source agreement and add a retrieval-evaluation dataset before expanding the corpus. The current stack (Next.js API route + Gemini + Pinecone) is a suitable architecture for this product; improve ingestion metadata and evaluation before replacing it.

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
# Gemini API Key (Get from aistudio.google.com)
GOOGLE_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Pinecone (Get from app.pinecone.io)
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
4.  **Important**: Add your `GOOGLE_API_KEY`, `PINECONE_API_KEY`, and `PINECONE_INDEX` in the Vercel **Environment Variables** settings.
5.  Click **Deploy**.

---

## ⚖️ Disclaimer
AskQanoon provides legal *information*, not legal *advice*. AI responses can contain errors. Always consult a qualified attorney for professional legal counsel.
