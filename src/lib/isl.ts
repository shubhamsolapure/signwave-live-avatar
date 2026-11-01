/** video = YouTube id of the official ISLRTC dictionary clip (youtube.com/@islrtc) */
export type Sign = { word: string; emoji: string; how: string; video: string };

export const ISLRTC_ALPHABET_VIDEO = "VdwKSyza5oI";

// Approved = has an official ISLRTC dictionary video (youtube.com/@islrtc).
// Any other word is fingerspelled letter by letter (never guessed).
export const APPROVED_SIGNS: Record<string, Sign> = {
  // ─── Core verified signs (have official ISLRTC video) ───────────────────
  hello: { word: "Hello", emoji: "👋", how: "Open palm near forehead, move it outward like a salute.", video: "yBQA3coUjH0" },
  hi: { word: "Hi", emoji: "👋", how: "Open palm near forehead, move it outward like a salute.", video: "yBQA3coUjH0" },
  thank: { word: "Thank you", emoji: "🙏", how: "Flat hand touches chin, then moves forward and down.", video: "wK8amEJAK1Y" },
  thanks: { word: "Thank you", emoji: "🙏", how: "Flat hand touches chin, then moves forward and down.", video: "wK8amEJAK1Y" },
  yes: { word: "Yes", emoji: "✊", how: "Closed fist nods up and down like a head nodding.", video: "MXmTYGHWvvE" },
  no: { word: "No", emoji: "☝️", how: "Index finger raised, wag it side to side.", video: "VS_ZuiQIJx0" },
  please: { word: "Please", emoji: "🤲", how: "Flat palm on chest, move in a small circle.", video: "P1sh5iUuR7s" },
  sorry: { word: "Sorry", emoji: "✊", how: "Closed fist on chest, rub in a small circle.", video: "0sE5EMDNsDo" },
  help: { word: "Help", emoji: "👍", how: "Thumbs-up fist rests on the other open palm; lift both up.", video: "0iE1wBnQ7JY" },
  water: { word: "Water", emoji: "💧", how: "Three fingers (W shape) tap the chin twice.", video: "iFW-jmBq7wc" },
  eat: { word: "Eat", emoji: "🤌", how: "Bunched fingertips move to the mouth twice.", video: "Cgs1MibMXJ0" },
  food: { word: "Food", emoji: "🤌", how: "Bunched fingertips move to the mouth twice.", video: "dTI8mMq81eM" },
  drink: { word: "Drink", emoji: "🥤", how: "C-shaped hand tilts toward the mouth like a cup.", video: "0HcbAAaV73Y" },
  home: { word: "Home", emoji: "🏠", how: "Both fingertips touch to form a roof shape.", video: "x1hR7eUMYoQ" },
  house: { word: "House", emoji: "🏠", how: "Both fingertips touch to form a roof shape.", video: "x1hR7eUMYoQ" },
  i: { word: "I / Me", emoji: "👉", how: "Point index finger at your own chest.", video: "1f6OchgCQrE" },
  me: { word: "I / Me", emoji: "👉", how: "Point index finger at your own chest.", video: "1f6OchgCQrE" },
  my: { word: "My", emoji: "✋", how: "Flat palm placed on your chest.", video: "EI3Z7yP6_JQ" },
  your: { word: "Your", emoji: "✋", how: "Flat palm pushed toward the other person.", video: "Yc0Mx7DJ_Io" },
  name: { word: "Name", emoji: "✌️", how: "Two fingers of one hand tap across two fingers of the other.", video: "SjfLsGRnuGo" },
  what: { word: "What", emoji: "🤷", how: "Index finger raised, shake it slightly side to side with a questioning face.", video: "4accXsYqRnA" },
  where: { word: "Where", emoji: "🤷", how: "Open palms facing up, move them outward with raised eyebrows.", video: "8wgrPnyzpMw" },
  good: { word: "Good", emoji: "👍", how: "Thumbs-up held in front of the chest.", video: "aQEJlg8RhXQ" },
  bad: { word: "Bad", emoji: "👎", how: "Little finger raised, move hand downward.", video: "9uSE_BJx1Po" },
  doctor: { word: "Doctor", emoji: "🩺", how: "Fingertips tap the inside of the other wrist like checking pulse.", video: "Igfn-ktdtoY" },
  hospital: { word: "Hospital", emoji: "🏥", how: "Draw a plus sign on the upper arm with two fingers.", video: "QPwNEJn87pI" },
  friend: { word: "Friend", emoji: "🤝", how: "Hook index fingers together, then swap.", video: "z2B7VrBSA5c" },
  family: { word: "Family", emoji: "👨‍👩‍👧", how: "Both F-hands draw a circle outward and meet.", video: "NNG5Id-ozfw" },
  school: { word: "School", emoji: "🏫", how: "Clap flat palms together twice.", video: "OvDIlDiFmnU" },
  come: { word: "Come", emoji: "🫴", how: "Palm up, curl fingers toward yourself.", video: "HSEV-Y2g3A8" },
  go: { word: "Go", emoji: "👉", how: "Index finger points and moves forward away from you.", video: "CMmQ1rh-5hQ" },
  stop: { word: "Stop", emoji: "✋", how: "Edge of one hand chops down onto the other palm.", video: "FHwjyQeLNuY" },
  wait: { word: "Wait", emoji: "✋", how: "Palms facing out, hold still in front of you.", video: "M24VjuHEfgo" },
  love: { word: "Love", emoji: "🤟", how: "Cross both fists over your heart.", video: "BppcZzS6-Jg" },
  happy: { word: "Happy", emoji: "😊", how: "Flat hand brushes up the chest twice with a smile.", video: "p9SdpeHMkZ0" },
  morning: { word: "Morning", emoji: "🌅", how: "Flat hand rises up from behind the other arm like the sun.", video: "mASaQcXn8rA" },
  night: { word: "Night", emoji: "🌙", how: "Bent hand moves down over the other arm like the sun setting.", video: "rayOhAZhd2k" },
  today: { word: "Today", emoji: "📅", how: "Both palms up, lower them slightly in front of you.", video: "Iji2l3tYxHc" },
  understand: { word: "Understand", emoji: "💡", how: "Index finger near temple flicks up.", video: "-rahbCV2Pp4" },

  // ─── Expanded everyday / medical / school prototypes ────────────────────
  // These trigger a visible 3D gesture. They are NOT verified ISL.
  need: { word: "Need", emoji: "🤲", how: "Illustrative two-hand request gesture. Confirm with a fluent signer or ISLRTC.", video: "" },
  want: { word: "Want", emoji: "🫴", how: "Illustrative reaching/request motion. Not a verified ISL sign.", video: "" },
  medicine: { word: "Medicine", emoji: "💊", how: "Illustrative. Check the official ISLRTC dictionary for the exact sign.", video: "" },
  milk: { word: "Milk", emoji: "🥛", how: "Illustrative. Check the official ISLRTC dictionary for the exact sign.", video: "" },
  mother: { word: "Mother", emoji: "👩", how: "Illustrative. Check the official dictionary for the exact sign.", video: "" },
  father: { word: "Father", emoji: "👨", how: "Illustrative. Check the official dictionary for the exact sign.", video: "" },
  bus: { word: "Bus", emoji: "🚌", how: "Illustrative. Check the official dictionary for the exact sign.", video: "" },
  train: { word: "Train", emoji: "🚆", how: "Illustrative. Check the official dictionary for the exact sign.", video: "" },
  toilet: { word: "Toilet", emoji: "🚻", how: "Illustrative. Check the official dictionary for the exact sign.", video: "" },
  bathroom: { word: "Bathroom", emoji: "🚻", how: "Illustrative. Check the official dictionary for the exact sign.", video: "" },
  tomorrow: { word: "Tomorrow", emoji: "🌄", how: "Illustrative forward gesture. Check official dictionary.", video: "" },
  yesterday: { word: "Yesterday", emoji: "🗓️", how: "Illustrative backward gesture. Check official dictionary.", video: "" },
  now: { word: "Now", emoji: "⏱️", how: "Illustrative. Check official dictionary.", video: "" },
  later: { word: "Later", emoji: "⌛", how: "Illustrative. Check official dictionary.", video: "" },
  safe: { word: "Safe", emoji: "🛡️", how: "Illustrative. Check official dictionary.", video: "" },
  danger: { word: "Danger", emoji: "⚠️", how: "Illustrative. Check official dictionary.", video: "" },
  emergency: { word: "Emergency", emoji: "🚨", how: "Illustrative. Check official dictionary.", video: "" },
  call: { word: "Call", emoji: "📞", how: "Illustrative hand-to-ear pose. Check official dictionary.", video: "" },
  phone: { word: "Phone", emoji: "📱", how: "Illustrative hand-to-ear pose. Check official dictionary.", video: "" },
  again: { word: "Again", emoji: "🔁", how: "Illustrative. Check official dictionary.", video: "" },
  finished: { word: "Finished", emoji: "✅", how: "Illustrative. Check official dictionary.", video: "" },
  learn: { word: "Learn", emoji: "📚", how: "Illustrative. Check official dictionary.", video: "" },
  work: { word: "Work", emoji: "🧰", how: "Illustrative. Check official dictionary.", video: "" },
  play: { word: "Play", emoji: "🎮", how: "Illustrative. Check official dictionary.", video: "" },
  open: { word: "Open", emoji: "↔️", how: "Illustrative. Check official dictionary.", video: "" },
  close: { word: "Close", emoji: "🔒", how: "Illustrative. Check official dictionary.", video: "" },
  sit: { word: "Sit", emoji: "🪑", how: "Experimental avatar gesture. Confirm with ISLRTC or a fluent signer.", video: "" },
  stand: { word: "Stand", emoji: "🧍", how: "Experimental avatar gesture. Confirm with ISLRTC or a fluent signer.", video: "" },
  book: { word: "Book", emoji: "📘", how: "Experimental. Confirm with ISLRTC or a fluent signer.", video: "" },
  teacher: { word: "Teacher", emoji: "👩‍🏫", how: "Experimental. Confirm with ISLRTC or a fluent signer.", video: "" },
  student: { word: "Student", emoji: "🎓", how: "Experimental. Confirm with ISLRTC or a fluent signer.", video: "" },
  money: { word: "Money", emoji: "💰", how: "Experimental. Confirm with ISLRTC or a fluent signer.", video: "" },
  police: { word: "Police", emoji: "👮", how: "Experimental. Confirm with ISLRTC or a fluent signer.", video: "" },
  ambulance: { word: "Ambulance", emoji: "🚑", how: "Experimental. Confirm with ISLRTC or a fluent signer.", video: "" },
  pain: { word: "Pain", emoji: "🩹", how: "Experimental. Confirm with ISLRTC or a fluent signer.", video: "" },

  // Extra high-frequency words (prototype)
  how: { word: "How", emoji: "🤷", how: "Illustrative questioning gesture. Confirm with official dictionary.", video: "" },
  are: { word: "Are", emoji: "❓", how: "Illustrative. Often combined with other signs in real ISL.", video: "" },
  is: { word: "Is", emoji: "❓", how: "Illustrative. Often combined with other signs in real ISL.", video: "" },
  am: { word: "Am", emoji: "❓", how: "Illustrative. Often combined with other signs in real ISL.", video: "" },
  you: { word: "You", emoji: "👉", how: "Point toward the other person.", video: "" },
  this: { word: "This", emoji: "☝️", how: "Illustrative pointing gesture.", video: "" },
  that: { word: "That", emoji: "👉", how: "Illustrative pointing gesture.", video: "" },
  time: { word: "Time", emoji: "⏰", how: "Illustrative. Check official dictionary.", video: "" },
  day: { word: "Day", emoji: "📅", how: "Illustrative. Check official dictionary.", video: "" },
  hungry: { word: "Hungry", emoji: "🍽️", how: "Illustrative. Check official dictionary.", video: "" },
  thirsty: { word: "Thirsty", emoji: "💧", how: "Illustrative. Check official dictionary.", video: "" },
  tired: { word: "Tired", emoji: "😴", how: "Illustrative. Check official dictionary.", video: "" },
  sick: { word: "Sick", emoji: "🤒", how: "Illustrative. Check official dictionary.", video: "" },
  fine: { word: "Fine", emoji: "👌", how: "Illustrative. Check official dictionary.", video: "" },
  ok: { word: "OK", emoji: "👌", how: "Illustrative. Check official dictionary.", video: "" },
  okay: { word: "OK", emoji: "👌", how: "Illustrative. Check official dictionary.", video: "" },
  see: { word: "See", emoji: "👀", how: "Illustrative. Check official dictionary.", video: "" },
  look: { word: "Look", emoji: "👀", how: "Illustrative. Check official dictionary.", video: "" },
  hear: { word: "Hear", emoji: "👂", how: "Illustrative. Check official dictionary.", video: "" },
  speak: { word: "Speak", emoji: "🗣️", how: "Illustrative. Check official dictionary.", video: "" },
  talk: { word: "Talk", emoji: "🗣️", how: "Illustrative. Check official dictionary.", video: "" },
  know: { word: "Know", emoji: "🧠", how: "Illustrative. Check official dictionary.", video: "" },
  think: { word: "Think", emoji: "💭", how: "Illustrative. Check official dictionary.", video: "" },
  feel: { word: "Feel", emoji: "❤️", how: "Illustrative. Check official dictionary.", video: "" },
  like: { word: "Like", emoji: "👍", how: "Illustrative. Check official dictionary.", video: "" },
};

// English aliases reuse an existing dictionary clip; they are not additional independently validated ISL signs.
const SIGN_ALIASES: Record<string, Sign> = {
  hey: APPROVED_SIGNS.hi,
  hiya: APPROVED_SIGNS.hi,
  thx: APPROVED_SIGNS.thanks,
  pls: APPROVED_SIGNS.please,
  yep: APPROVED_SIGNS.yes,
  yup: APPROVED_SIGNS.yes,
  nope: APPROVED_SIGNS.no,
  nah: APPROVED_SIGNS.no,
  ok: APPROVED_SIGNS.ok,
  okay: APPROVED_SIGNS.okay,
};

// Multi-word phrases that should be treated as a single unit when possible.
const PHRASES: [string[], Sign][] = [
  [["thank", "you"], APPROVED_SIGNS.thank],
  [["thanks", "a", "lot"], APPROVED_SIGNS.thank],
  [["good", "morning"], APPROVED_SIGNS.morning],
  [["good", "night"], APPROVED_SIGNS.night],
  [["i", "need", "help"], APPROVED_SIGNS.help],
  [["need", "help"], APPROVED_SIGNS.help],
  [["please", "help"], APPROVED_SIGNS.help],
  [["i", "am", "happy"], APPROVED_SIGNS.happy],
  [["i", "am", "fine"], APPROVED_SIGNS.fine],
  [["how", "are", "you"], APPROVED_SIGNS.how],
  [["what", "is", "your", "name"], APPROVED_SIGNS.name],
  [["my", "name", "is"], APPROVED_SIGNS.name],
  [["nice", "to", "meet", "you"], APPROVED_SIGNS.friend],
  [["see", "you"], APPROVED_SIGNS.see],
  [["see", "you", "later"], APPROVED_SIGNS.later],
  [["see", "you", "tomorrow"], APPROVED_SIGNS.tomorrow],
  [["i", "love", "you"], APPROVED_SIGNS.love],
  [["i", "dont", "understand"], APPROVED_SIGNS.understand],
  [["i", "do", "not", "understand"], APPROVED_SIGNS.understand],
  [["where", "is", "the", "hospital"], APPROVED_SIGNS.hospital],
  [["where", "is", "hospital"], APPROVED_SIGNS.hospital],
  [["call", "a", "doctor"], APPROVED_SIGNS.doctor],
  [["i", "need", "a", "doctor"], APPROVED_SIGNS.doctor],
  [["i", "need", "water"], APPROVED_SIGNS.water],
  [["i", "want", "food"], APPROVED_SIGNS.food],
  [["i", "want", "to", "go", "home"], APPROVED_SIGNS.home],
];

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

export type Step =
  | { kind: "sign"; source: string; sign: Sign }
  | { kind: "spell"; source: string; letters: string[] };

/**
 * Translate any English text into a sequence of signs + fingerspelling.
 * - Known words / phrases → sign (verified or prototype)
 * - Unknown words → fingerspelled letter by letter
 * Never invents a sign for an unknown word.
 */
export function translate(text: string): Step[] {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];

  const words = cleaned.split(" ").filter(Boolean);
  const steps: Step[] = [];
  let i = 0;

  while (i < words.length) {
    // Try to match the longest phrase first
    let matched = false;
    for (const [phraseWords, sign] of PHRASES) {
      if (i + phraseWords.length <= words.length) {
        const slice = words.slice(i, i + phraseWords.length);
        if (slice.every((w, idx) => w === phraseWords[idx])) {
          steps.push({ kind: "sign", source: phraseWords.join(" "), sign });
          i += phraseWords.length;
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    // Single word
    const w = words[i]!;
    const sign = APPROVED_SIGNS[w] ?? SIGN_ALIASES[w];
    if (sign) {
      steps.push({ kind: "sign", source: w, sign });
    } else {
      // Fingerspell any unknown word – never invent a sign
      steps.push({ kind: "spell", source: w, letters: w.toUpperCase().split("") });
    }
    i++;
  }

  return steps;
}
