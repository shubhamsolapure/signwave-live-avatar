export type Sign = { word: string; emoji: string; how: string };

// Approved sign dictionary — only these are shown as whole-word signs.
// Any other word is fingerspelled letter by letter (never guessed).
export const APPROVED_SIGNS: Record<string, Sign> = {
  hello: { word: "Hello", emoji: "👋", how: "Open palm near forehead, move it outward like a salute." },
  hi: { word: "Hi", emoji: "👋", how: "Open palm near forehead, move it outward like a salute." },
  thank: { word: "Thank you", emoji: "🙏", how: "Flat hand touches chin, then moves forward and down." },
  thanks: { word: "Thank you", emoji: "🙏", how: "Flat hand touches chin, then moves forward and down." },
  yes: { word: "Yes", emoji: "✊", how: "Closed fist nods up and down like a head nodding." },
  no: { word: "No", emoji: "☝️", how: "Index finger raised, wag it side to side." },
  please: { word: "Please", emoji: "🤲", how: "Flat palm on chest, move in a small circle." },
  sorry: { word: "Sorry", emoji: "✊", how: "Closed fist on chest, rub in a small circle." },
  help: { word: "Help", emoji: "👍", how: "Thumbs-up fist rests on the other open palm; lift both up." },
  water: { word: "Water", emoji: "💧", how: "Three fingers (W shape) tap the chin twice." },
  eat: { word: "Eat", emoji: "🤌", how: "Bunched fingertips move to the mouth twice." },
  food: { word: "Food", emoji: "🤌", how: "Bunched fingertips move to the mouth twice." },
  drink: { word: "Drink", emoji: "🥤", how: "C-shaped hand tilts toward the mouth like a cup." },
  home: { word: "Home", emoji: "🏠", how: "Both fingertips touch to form a roof shape." },
  house: { word: "House", emoji: "🏠", how: "Both fingertips touch to form a roof shape." },
  i: { word: "I / Me", emoji: "👉", how: "Point index finger at your own chest." },
  me: { word: "I / Me", emoji: "👉", how: "Point index finger at your own chest." },
  my: { word: "My", emoji: "✋", how: "Flat palm placed on your chest." },
  you: { word: "You", emoji: "👉", how: "Point index finger toward the other person." },
  your: { word: "Your", emoji: "✋", how: "Flat palm pushed toward the other person." },
  name: { word: "Name", emoji: "✌️", how: "Two fingers of one hand tap across two fingers of the other." },
  what: { word: "What", emoji: "🤷", how: "Index finger raised, shake it slightly side to side with a questioning face." },
  where: { word: "Where", emoji: "🤷", how: "Open palms facing up, move them outward with raised eyebrows." },
  good: { word: "Good", emoji: "👍", how: "Thumbs-up held in front of the chest." },
  bad: { word: "Bad", emoji: "👎", how: "Little finger raised, move hand downward." },
  doctor: { word: "Doctor", emoji: "🩺", how: "Fingertips tap the inside of the other wrist like checking pulse." },
  hospital: { word: "Hospital", emoji: "🏥", how: "Draw a plus sign on the upper arm with two fingers." },
  friend: { word: "Friend", emoji: "🤝", how: "Hook index fingers together, then swap." },
  family: { word: "Family", emoji: "👨‍👩‍👧", how: "Both F-hands draw a circle outward and meet." },
  school: { word: "School", emoji: "🏫", how: "Clap flat palms together twice." },
  come: { word: "Come", emoji: "🫴", how: "Palm up, curl fingers toward yourself." },
  go: { word: "Go", emoji: "👉", how: "Index finger points and moves forward away from you." },
  stop: { word: "Stop", emoji: "✋", how: "Edge of one hand chops down onto the other palm." },
  wait: { word: "Wait", emoji: "✋", how: "Palms facing out, hold still in front of you." },
  love: { word: "Love", emoji: "🤟", how: "Cross both fists over your heart." },
  happy: { word: "Happy", emoji: "😊", how: "Flat hand brushes up the chest twice with a smile." },
  morning: { word: "Morning", emoji: "🌅", how: "Flat hand rises up from behind the other arm like the sun." },
  night: { word: "Night", emoji: "🌙", how: "Bent hand moves down over the other arm like the sun setting." },
  today: { word: "Today", emoji: "📅", how: "Both palms up, lower them slightly in front of you." },
  understand: { word: "Understand", emoji: "💡", how: "Index finger near temple flicks up." },
};

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

export type Step =
  | { kind: "sign"; source: string; sign: Sign }
  | { kind: "spell"; source: string; letters: string[] };

const FILLER = new Set(["a", "an", "the", "is", "am", "are", "to", "of"]);

export function translate(text: string): Step[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/'/g, "").split(/\s+/).filter(Boolean);
  const steps: Step[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i]!;
    if (FILLER.has(w)) continue;
    if (w === "thank" && words[i + 1] === "you") i++; // "thank you" is one sign // ISL grammar drops these
    const sign = APPROVED_SIGNS[w];
    if (sign) steps.push({ kind: "sign", source: w, sign });
    else steps.push({ kind: "spell", source: w, letters: w.toUpperCase().split("") });
  }
  return steps;
}
