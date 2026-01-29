# AskQanoon: Understand Pakistani Law. Simply.

AskQanoon is a premium, RAG-powered legal information assistant designed to help Pakistani citizens navigate the complexities of local laws using simple language.

## 1️⃣ Functional Requirements

### User Interaction
- **Bilingual Support**: Ask questions in English or Roman Urdu.
- **Chat Interface**: Clean, intuitive chat-based interaction.
- **Conversational Memory**: Support for follow-up questions within the same session.
- **User Management**: (Upcoming) Store user profiles and conversation history for personalized experience.

### Legal Information Retrieval (RAG Core)
- **Knowledge Base**: Curated data from PPC, CrPC, Family Laws, and PECA.
- **Semantic Search**: Uses vector embeddings to find the most relevant law sections.
- **Context Optimization**: Limits retrieval to top-k relevant chunks (300-500 tokens).

### Response Generation
- **Grounded Answers**: Generates responses strictly using retrieved documents.
- **Simplification**: Translates complex legal jargon into simple, non-legal language.
- **No Verdicts**: Avoids giving verdicts or guarantees; provides information, not advice.
- **Disclaimer**: Includes a legal disclaimer in every response.

### Source Transparency
- **Citations**: Displays law names (e.g., PPC, CrPC) and section numbers.
- **Transparency**: Clearly indicates if information is not found in the knowledge base.

### Safety & Compliance
- **Refusal Logic**: Refuses requests for illegal activities or evasion of law enforcement.
- **Guardrails**: Displays: “This is legal information, not legal advice.”

## 2️⃣ Technical Stack

- **Frontend**: Next.js + Tailwind CSS + Shadcn UI + Framer Motion.
- **Backend/Orchestration**: Next.js API routes integrated with **LangChain**.
- **Database (ORM)**: **Prisma** with a relational/NoSQL database for user data.
- **AI Model**: Google Gemini 3 (for reasoning, summarization, and safe generation).
- **Vector Database**: Pinecone (Free Tier) for storage and retrieval.
- **Embeddings**: Gemini Text Embedding model.
- **Deployment**: Vercel.

## 3️⃣ RAG Architecture

AskQanoon utilizes a state-of-the-art RAG (Retrieval-Augmented Generation) flow orchestrated by **LangChain**:

1.  **Ingestion**: Legal docs are chunked (300-500 tokens with 50-token overlap) and stored in Pinecone with metadata (`law_name`, `section_number`, `topic`).
2.  **Query**: User questions are converted into embeddings.
3.  **Retrieval**: LangChain fetches relevant chunks from Pinecone.
4.  **Augmentation**: Context is injected into a strict system prompt.
5.  **Generation**: Gemini generates a simplified response with citations.

---

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Disclaimer
AskQanoon is an experimental AI tool. It provides legal information, not legal advice. Always consult a qualified lawyer.
