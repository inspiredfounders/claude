// ─── Daily Inspired Notification Content ──────────────────────────────────────
// Each day produces one quote + one question, deterministically seeded by date.

export type ContentType = "quote" | "question" | "challenge" | "reflection";

export interface DailyNotification {
  type: ContentType;
  title: string;
  body: string;
  cta: string;
}

// ─── Content pools ─────────────────────────────────────────────────────────────

const QUOTES: Array<{ title: string; body: string }> = [
  { title: "On building", body: "\"The best time to plant a tree was 20 years ago. The second best time is now.\" Build the thing." },
  { title: "On courage", body: "\"You don't have to be great to start, but you have to start to be great.\" — Les Brown" },
  { title: "On vision", body: "\"The people who are crazy enough to think they can change the world are the ones who do.\" — Steve Jobs" },
  { title: "On resilience", body: "\"It's not whether you get knocked down — it's whether you get up.\" — Vince Lombardi" },
  { title: "On momentum", body: "\"A small daily task, done well, beats a rare masterpiece.\" Start your streak today." },
  { title: "On identity", body: "\"You are not your business. But your business is an expression of who you are becoming.\"" },
  { title: "On risk", body: "\"The biggest risk is not taking any risk. In a world that's changing fast, the only strategy that is guaranteed to fail is not taking risks.\" — Mark Zuckerberg" },
  { title: "On focus", body: "\"It's not about ideas. It's about making ideas happen.\" — Scott Belsky" },
  { title: "On purpose", body: "\"He who has a why to live can bear almost any how.\" — Nietzsche. What's your why today?" },
  { title: "On clarity", body: "\"Clarity is the most powerful weapon a founder can carry. What are you clear on today?\"" },
  { title: "On execution", body: "\"Vision without execution is hallucination.\" — Thomas Edison. What moves today?" },
  { title: "On compounding", body: "\"Success is the product of daily habits, not once-in-a-lifetime transformations.\" — James Clear" },
  { title: "On trust", body: "\"Trust yourself. You know more than you think you do.\" — Benjamin Spock" },
  { title: "On leadership", body: "\"The greatest leader is not necessarily the one who does the greatest things. They are the one that gets people to do the greatest things.\"" },
  { title: "On timing", body: "\"You are not late. You are exactly on time for the life you're building.\"" },
  { title: "On grit", body: "\"Fall seven times, stand up eight.\" — Japanese Proverb. What are you standing up from today?" },
  { title: "On growth", body: "\"Growth and comfort do not coexist.\" — Ginni Rometty. Where are you choosing growth?" },
  { title: "On wealth", body: "\"Wealth is not about having a lot of money; it's about having a lot of options.\" — Chris Rock" },
  { title: "On discipline", body: "\"Discipline is choosing between what you want now and what you want most.\"" },
  { title: "On originality", body: "\"The person who follows the crowd will usually go no further than the crowd. The person who walks alone is likely to find themselves in places no one has ever seen.\"" },
  { title: "On perseverance", body: "\"Most people give up just before the breakthrough.\" Today might be that day. Don't stop." },
  { title: "On service", body: "\"The best way to find yourself is to lose yourself in the service of others.\" — Gandhi" },
  { title: "On time", body: "\"Don't count the days — make the days count.\" — Muhammad Ali" },
  { title: "On decisions", body: "\"In any moment of decision, the best thing you can do is the right thing, the next best is the wrong thing, and the worst thing you can do is nothing.\" — T. Roosevelt" },
  { title: "On confidence", body: "\"Confidence is not 'they will like me.' Confidence is 'I'll be fine if they don't.'\"" },
  { title: "On abundance", body: "\"There is enough for everyone. When you believe that, you stop competing and start creating.\"" },
  { title: "On beginnings", body: "\"Every expert was once a beginner. Every pro was once an amateur.\" Keep going." },
  { title: "On priorities", body: "\"What matters most must never be at the mercy of what matters least.\" — Johann Wolfgang von Goethe" },
];

const QUESTIONS: Array<{ title: string; body: string }> = [
  { title: "Start your day with this →", body: "If you could only work on one thing today to move your business forward, what would it be?" },
  { title: "A question worth sitting with", body: "Who do you need to become to achieve what you're building?" },
  { title: "For your founder journal", body: "What would you do if you knew you couldn't fail? Are you doing it?" },
  { title: "Today's reflection", body: "What's one belief about yourself that's quietly holding your business back?" },
  { title: "The hard question", body: "Are you building something the world needs, or something you think the world needs?" },
  { title: "For the ambitious founder", body: "What would your best customer say about you that you haven't said about yourself yet?" },
  { title: "Identity check", body: "Are you playing the role of a founder, or are you actually being one? What's the difference for you?" },
  { title: "Today's founder prompt", body: "If a journalist wrote about your business today, what would the headline be? Is that the headline you want?" },
  { title: "Morning challenge", body: "Name one thing you've been avoiding that, if done, would change everything." },
  { title: "The Muse asks...", body: "What does your business look like in 5 years if you never change how you spend your days?" },
  { title: "Strategic clarity", body: "Who is the one person saying 'no' to your offer right now, and why? How does their reason change your approach?" },
  { title: "Gut check", body: "On a scale of 1–10, how much do you believe in what you're building? What would make it a 10?" },
  { title: "The courageous question", body: "What would you do if you weren't afraid of what people would think?" },
  { title: "Revenue clarity", body: "Do you know exactly who your next 3 clients are? If not — what's stopping you from knowing?" },
  { title: "The identity question", body: "What's the version of you that future-you is proud of? What does that person do on days like today?" },
  { title: "Founder's mirror", body: "What's one thing your team or customers see in you that you haven't fully claimed yet?" },
  { title: "For deeper thinking", body: "Are you optimising for speed or for depth right now? Which one does your business actually need?" },
  { title: "Burn the boats moment", body: "What would you commit to if there was no plan B?" },
  { title: "The market question", body: "If your top competitor shut down tomorrow, what would change for your business? What does that tell you?" },
  { title: "Presence check", body: "When was the last time you were fully present — no distractions, no noise — and what came through when you were?" },
];

const CHALLENGES: Array<{ title: string; body: string }> = [
  { title: "Today's challenge", body: "Send a genuine, unrequested message of appreciation to someone in your network. No agenda. Just gratitude." },
  { title: "10-minute founder sprint", body: "Write down your top 3 revenue-generating activities. Block 2 hours for the most important one. Right now." },
  { title: "The visibility challenge", body: "Share one insight, story, or lesson from your founder journey publicly today. Your people are waiting to hear from you." },
  { title: "Connection challenge", body: "Reach out to one Club member you haven't spoken to yet. Introduce yourself. Start with a question, not a pitch." },
  { title: "Clarity challenge", body: "Write your brand's one-sentence promise in 15 words or less. Show it to someone outside your industry. Do they get it instantly?" },
  { title: "Today's boldness challenge", body: "Make the ask you've been putting off. The partnership. The introduction. The rate increase. Send it today." },
  { title: "The audit challenge", body: "Track every hour you spend today. At 5pm, look at the list. Does how you spent your time match your stated priorities?" },
  { title: "Content challenge", body: "Record a 60-second voice or video note answering: 'What do I know about [my industry] that most people don't?' Post it somewhere." },
];

const REFLECTIONS: Array<{ title: string; body: string }> = [
  { title: "Evening reflection", body: "What happened today that you weren't expecting? What did it teach you?" },
  { title: "Gratitude for founders", body: "Name 3 things your business has given you that money can't quantify. Let that sink in tonight." },
  { title: "End of day", body: "What's one decision you made today you're proud of? Own it. That's who you're becoming." },
  { title: "Weekly wind-down", body: "What's one thing you did this week that future-you will thank you for?" },
  { title: "The wins audit", body: "List every win from the past 7 days — no matter how small. Founders forget to celebrate. Tonight, celebrate." },
];

// ─── Deterministic daily seeder ───────────────────────────────────────────────

function seededRand(seed: number, max: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % max | 0;
}

export function getDailyNotification(dateStr?: string): DailyNotification {
  const today = dateStr ?? new Date().toISOString().split("T")[0];
  const seed  = parseInt(today.replace(/-/g, ""), 10);

  const dayOfYear = Math.floor((new Date(today).getTime() - new Date(new Date(today).getFullYear(), 0, 0).getTime()) / 86400000);
  const typeIdx   = dayOfYear % 4;

  const typeMap: ContentType[] = ["quote", "question", "challenge", "reflection"];
  const type = typeMap[typeIdx];

  const ctaMap: Record<ContentType, string> = {
    quote:      "Open the app →",
    question:   "Reflect in the app →",
    challenge:  "Accept the challenge →",
    reflection: "Journal your answer →",
  };

  let item: { title: string; body: string };
  if (type === "quote") {
    item = QUOTES[seededRand(seed, QUOTES.length)];
  } else if (type === "question") {
    item = QUESTIONS[seededRand(seed + 1, QUESTIONS.length)];
  } else if (type === "challenge") {
    item = CHALLENGES[seededRand(seed + 2, CHALLENGES.length)];
  } else {
    item = REFLECTIONS[seededRand(seed + 3, REFLECTIONS.length)];
  }

  return { type, title: item.title, body: item.body, cta: ctaMap[type] };
}

export function getNotificationPreview(count = 5): DailyNotification[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return getDailyNotification(d.toISOString().split("T")[0]);
  });
}
