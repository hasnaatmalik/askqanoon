/**
 * Suggested questions, grouped by everyday situation.
 * Every question is answerable from the ingested law library (data/laws.txt + PPC/CrPC),
 * so a first tap always produces a cited answer.
 */
export interface StarterQuestion {
  en: string;
  ur: string;
}

export interface StarterTopic {
  id: string;
  label: { en: string; ur: string };
  questions: StarterQuestion[];
}

export const STARTER_TOPICS: StarterTopic[] = [
  {
    id: "police",
    label: { en: "Police & FIR", ur: "Police aur FIR" },
    questions: [
      {
        en: "How do I file an FIR, and what should I do if the police refuse?",
        ur: "FIR kaise darj karwate hain, aur agar police inkar kare to kya karein?",
      },
      {
        en: "What are my rights if I am arrested?",
        ur: "Agar mujhe giraftar kiya jaye to mere kya huqooq hain?",
      },
      {
        en: "What is the difference between bailable and non-bailable offences?",
        ur: "Bailable aur non-bailable jurm mein kya farq hai?",
      },
      {
        en: "What is the punishment for cheating under Section 420?",
        ur: "Section 420 ke tehat dhokha dahi ki saza kya hai?",
      },
    ],
  },
  {
    id: "rent",
    label: { en: "Rent & landlord", ur: "Kiraya aur landlord" },
    questions: [
      {
        en: "Can my landlord cut off my electricity to make me leave?",
        ur: "Kya landlord mujhe nikalne ke liye bijli kaat sakta hai?",
      },
      {
        en: "When can a landlord legally evict me?",
        ur: "Landlord kab qanooni tor par mujhe ghar se nikal sakta hai?",
      },
      {
        en: "How much can my landlord raise the rent each year?",
        ur: "Landlord har saal kiraya kitna barha sakta hai?",
      },
      {
        en: "Does a rent agreement have to be in writing?",
        ur: "Kya kiraya nama likhna zaroori hai?",
      },
    ],
  },
  {
    id: "work",
    label: { en: "Work & salary", ur: "Naukri aur tankhwah" },
    questions: [
      {
        en: "How much notice must my employer give before firing me?",
        ur: "Naukri se nikalne se pehle employer ko kitna notice dena hoga?",
      },
      {
        en: "What is the minimum wage right now?",
        ur: "Is waqt kam az kam tankhwah kitni hai?",
      },
      {
        en: "How many hours can I be made to work, and what about overtime?",
        ur: "Mujhse kitne ghante kaam liya ja sakta hai, aur overtime ka kya hukam hai?",
      },
      {
        en: "How long is maternity leave?",
        ur: "Maternity leave kitni hoti hai?",
      },
    ],
  },
  {
    id: "family",
    label: { en: "Marriage & family", ur: "Nikah aur khandan" },
    questions: [
      {
        en: "What is the legal procedure for talaq?",
        ur: "Talaq ka qanooni tareeqa kya hai?",
      },
      {
        en: "Can a husband take a second wife without permission?",
        ur: "Kya shohar bina ijazat doosri shadi kar sakta hai?",
      },
      {
        en: "What can I do if my husband does not pay maintenance?",
        ur: "Agar shohar kharcha na de to main kya kar sakti hoon?",
      },
      {
        en: "Does a nikah have to be registered?",
        ur: "Kya nikah ka register hona zaroori hai?",
      },
    ],
  },
  {
    id: "online",
    label: { en: "Online & cyber", ur: "Online aur cyber" },
    questions: [
      {
        en: "Someone is sharing my private photos online. What can I do?",
        ur: "Koi meri nijji tasveerein online share kar raha hai. Main kya karoon?",
      },
      {
        en: "How do I report online fraud or harassment to the FIA?",
        ur: "Online fraud ya harassment FIA ko kaise report karein?",
      },
      {
        en: "What is the punishment for online defamation?",
        ur: "Online badnaami ki saza kya hai?",
      },
      {
        en: "What counts as cyber-stalking?",
        ur: "Cyber-stalking kis ko kehte hain?",
      },
    ],
  },
  {
    id: "consumer",
    label: { en: "Shopping & refunds", ur: "Khareedari aur refund" },
    questions: [
      {
        en: "A shop sold me a defective product. What are my rights?",
        ur: "Dukaan ne kharab cheez bechi hai. Mere kya huqooq hain?",
      },
      {
        en: "What is the 15-day notice before a consumer case?",
        ur: "Consumer case se pehle 15 din ka notice kya hota hai?",
      },
      {
        en: "Do I need a lawyer for consumer court?",
        ur: "Kya consumer court ke liye wakeel zaroori hai?",
      },
      {
        en: "Can a shop charge more than the displayed price?",
        ur: "Kya dukaan darj shuda qeemat se zyada le sakti hai?",
      },
    ],
  },
  {
    id: "rights",
    label: { en: "Women & basic rights", ur: "Khawateen aur buniyadi huqooq" },
    questions: [
      {
        en: "Is domestic violence a crime, and where can I get help?",
        ur: "Kya gharelu tashaddud jurm hai, aur madad kahan se milegi?",
      },
      {
        en: "Can a woman be forced out of her husband's house?",
        ur: "Kya aurat ko shohar ke ghar se zabardasti nikala ja sakta hai?",
      },
      {
        en: "What does the right to a fair trial mean?",
        ur: "Munsifana muqadme ke haq ka kya matlab hai?",
      },
      {
        en: "Is education free for children in Pakistan?",
        ur: "Kya Pakistan mein bachon ki taleem muft hai?",
      },
    ],
  },
];

/** One standout question per topic, for the landing page. */
export const LANDING_STARTERS: StarterQuestion[] = [
  STARTER_TOPICS[1].questions[0],
  STARTER_TOPICS[0].questions[0],
  STARTER_TOPICS[2].questions[0],
  STARTER_TOPICS[4].questions[0],
  STARTER_TOPICS[5].questions[0],
  STARTER_TOPICS[3].questions[0],
];

export const MAX_QUESTION_LENGTH = 2_000;
