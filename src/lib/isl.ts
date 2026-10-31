/** video = YouTube id of the official ISLRTC dictionary clip (youtube.com/@islrtc) */
export type Sign = { word: string; emoji: string; how: string; video: string };

export const ISLRTC_ALPHABET_VIDEO = "VdwKSyza5oI";

// Approved = has an official ISLRTC dictionary video (youtube.com/@islrtc).
// Any other word is fingerspelled letter by letter (never guessed).
export const APPROVED_SIGNS: Record<string, Sign> = {
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
