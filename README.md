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

## 🛡️ Answer Quality and Safety

The chat path is intentionally grounded:

- The API validates question size and preserves only the last six valid chat turns.
- **HyDE Retrieval**: Before searching Pinecone, the AI generates a hypothetical "ideal answer" and embeds *that* to find highly relevant legal chunks.
- Every legal claim must cite its retrieved source tag (`[S1]`, `[S2]`); the matching source cards are shown below the response.
- When the database cannot support an answer, AskQanoon explicitly says so instead of hallucinating a demonstration answer.
- Roman Urdu mode requires Latin-script Urdu output; the legal source names and section numbers remain unchanged.

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
5.  Click **Deploy**.

---

## ⚖️ Disclaimer
AskQanoon provides legal *information*, not legal *advice*. AI responses can contain errors. Always consult a qualified attorney for professional legal counsel.
