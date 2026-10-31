import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
const Signer3D = lazy(() => import("@/components/Signer3D"));
import { translate, APPROVED_SIGNS, ISLRTC_ALPHABET_VIDEO, type Step } from "@/lib/isl";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saanjh — Voice & Text to Indian Sign Language" },
      { name: "description", content: "Explore Indian Sign Language dictionary clips and fingerspelling for typed or spoken text." },
      { property: "og:title", content: "Saanjh — Voice & Text to ISL" },
      { property: "og:description", content: "A prototype for exploring ISL dictionary clips and fingerspelling from speech or text." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const OFFICIAL_ISL_LOOKUPS: Record<string, { label: string; url: string }> = {
  "accident": { label: "Accident", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=29&search=Accident&type=list" },
  "pain": { label: "Ache / Pain", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=40&search=Ache%2C+Pain&type=list" },
  "able": { label: "Able / Can", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=13&search=Able%2C+Can&type=list" },
  "afternoon": { label: "Afternoon", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=89&search=Afternoon&type=list" },
  "airport": { label: "Airport", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=117&search=Airport&type=list" },
  "allergy": { label: "Allergy", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=139&search=Allergy&type=list" },
  "ambulance": { label: "Ambulance", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=165&search=Ambulance&type=list" },
  "answer": { label: "Answer", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=184&search=Answer&type=list" },
  "apple": { label: "Apple", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=195&search=Apple&type=list" },
  "ask": { label: "Ask / Question", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=244&search=Ask%2C+Question&type=list" },
  "aunt": { label: "Aunt", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=273&search=Aunt&type=list" },
  "available": { label: "Available", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=279&search=Available&type=list" },
  "award": { label: "Award / Prize", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=283&search=Award%2C+Prize&type=list" },
  "man": { label: "Man", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2055&search=Man&type=list" },
  "mango": { label: "Mango", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2058&search=Mango&type=list" },
  "market": { label: "Market", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2067&search=Market&type=list" },
  "medicine": { label: "Medicine", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2102&search=Medicine&type=list" },
  "message": { label: "Message", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2116&search=Message&type=list" },
  "metro": { label: "Metro", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2124&search=Metro&type=list" },
  "milk": { label: "Milk", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2137&search=Milk&type=list" },
  "morning": { label: "Morning", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2176&search=Morning&type=list" },
  "mother": { label: "Mother", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2181&search=Mother&type=list" },
  "my": { label: "My", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=2212&search=My&type=list" },
  "air pollution": { label: "Air pollution", url: "https://divyangjan.depwd.gov.in/islrtc/search.php?id=113&search=Air+Pollution&type=list" },
};

type Frame = { label: string; big: string; how: string; verified: boolean; word: string | null; video: string | null; lookupUrl: string | null };

function toFrames(steps: Step[]): Frame[] {
  return steps.flatMap((s): Frame[] =>
    s.kind === "sign"
      ? [{ label: s.sign.word, big: s.sign.emoji, how: s.sign.how, verified: true, word: s.sign.word, video: s.sign.video, lookupUrl: null }]
      : s.letters.map((l, i) => ({
          label: `Spell "${s.source}" · ${i + 1}/${s.letters.length}`,
          big: l,
          how: `Fingerspell the letter ${l} with ISL two-hand alphabet.`,
          verified: false,
          word: null,
          video: null,
          lookupUrl: OFFICIAL_ISL_LOOKUPS[s.source.toLowerCase()]?.url ?? "https://divyangjan.depwd.gov.in/islrtc/",
        })),
  );
}

function Index() {
  const [text, setText] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [mode, setMode] = useState<"real" | "avatar">("real");
  const [micOk, setMicOk] = useState(true);
  const [slowPlayback, setSlowPlayback] = useState(false);
  const [phraseQuery, setPhraseQuery] = useState("");
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setMicOk(false);
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = true;
    r.onresult = (e: any) => setText(Array.from(e.results).map((x: any) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    recRef.current = r;
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (idx >= frames.length - 1) return setPlaying(false);
    const t = setTimeout(() => setIdx((i) => i + 1), (frames[idx]?.verified ? (mode === "real" ? 5000 : 2200) : 1100) * (slowPlayback ? 1.8 : 1));
    return () => clearTimeout(t);
  }, [playing, idx, frames, mode, slowPlayback]);

  const go = (t = text) => {
    const f = toFrames(translate(t));
    setFrames(f);
    setIdx(0);
    setPlaying(f.length > 0);
  };

  const mic = () => {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); return; }
    setText("");
    recRef.current.onend = () => { setListening(false); setText((t) => { go(t); return t; }); };
    recRef.current.start();
    setListening(true);
  };

  const cur = frames[idx];
  const quick = ["Hello", "Thank you", "I need help", "Where is the hospital?"];
  const phraseGroups = [
    { title: "Greetings & introductions", items: ["Hello", "Good morning", "Good night", "What is your name?", "My name is Rahul", "Nice to meet you", "How are you?", "I am happy", "Thank you", "You are my friend"] },
    { title: "Needs & everyday life", items: ["I need help", "I need water", "I want food", "I want to drink water", "Please wait", "Come here", "Please come", "Go there", "Stop please", "I want to go home"] },
    { title: "Health & safety", items: ["Call a doctor", "Where is the hospital?", "I need a doctor", "I am not feeling good", "Please help me", "I need water now", "I am hurt", "Call my family", "I need help now", "Please stop"] },
    { title: "School & social", items: ["Where is the school?", "I love my family", "You are a good friend", "I understand", "I do not understand", "What is this?", "Where are you?", "Please tell me", "See you today", "Thank you for helping me"] },
    { title: "Home & travel", items: ["Where is my home?", "I want to go home", "Come with me", "Go to school", "Where is the bus?", "I need to go now", "Please come here", "Wait for me", "This is my house", "Where should I go?"] },
    { title: "Time & conversation", items: ["What time is it?", "See you tomorrow", "See you later", "I am here today", "Are you okay?", "Yes, I understand", "No, I do not understand", "Please repeat", "Can you help me?", "Thank you very much"] },
  ];
  const visiblePhrases = phraseGroups.map((group) => ({
    ...group,
    items: group.items.filter((phrase) => phrase.toLowerCase().includes(phraseQuery.toLowerCase().trim())),
  })).filter((group) => group.items.length > 0);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Saanjh</p>
          <h1 className="font-display text-4xl leading-tight text-foreground">Speak or type.<br />See it in sign.</h1>
          <p className="mt-2 text-muted-foreground">Explore ISL dictionary clips and fingerspelling. This prototype is not a validated sentence-level ISL translator; keep the original caption visible and confirm meaning with a fluent ISL signer.</p>
        </header>

        <div className="mode-toggle" role="tablist">
          <button className={mode === "real" ? "mode-on" : "mode-off"} onClick={() => setMode("real")}>Real signer (official)</button>
          <button className={mode === "avatar" ? "mode-on" : "mode-off"} onClick={() => setMode("avatar")}>3D character</button>
        </div>
        <div className="avatar-frame">
          {mode === "real" ? (
            cur?.video ? (
              <iframe key={cur.video} className="h-full w-full" title={`ISL sign: ${cur.label}`} allow="autoplay; encrypted-media" allowFullScreen
                src={`https://www.youtube-nocookie.com/embed/${cur.video}?autoplay=1&mute=1&loop=1&playlist=${cur.video}&controls=0&rel=0&modestbranding=1&playsinline=1`} />
            ) : cur ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="font-display text-8xl text-foreground">{cur.big}</span>
                <a className="chip" href={`https://www.youtube.com/watch?v=${ISLRTC_ALPHABET_VIDEO}`} target="_blank" rel="noreferrer">Watch official ISL alphabet ↗</a>
              </div>
            ) : (
              <div className="grid h-full place-items-center p-6 text-center text-muted-foreground">Select a message to explore a dictionary clip or fingerspelling</div>
            )
          ) : (
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <Signer3D word={cur?.word ?? null} spelling={!!cur && !cur.verified} />
            </Suspense>
          </ClientOnly>
          )}
          {mode === "avatar" && cur && !cur.verified && <span className="avatar-letter">{cur.big}</span>}
        </div>

        <section className="stage" aria-live="polite">
          {cur ? (
            <>
              <span className={cur.verified ? "badge-verified" : "badge-spell"}>{cur.verified ? "Dictionary video available · check clip" : "Fingerspelling"}</span>
              <div className="key-in text-5xl font-display" key={idx}>{cur.big}</div>
              <p className="text-2xl font-display text-foreground">{cur.label}</p>
              {!(mode === "real" && cur.verified) && <p className="text-muted-foreground">{cur.how}</p>}
              {cur.lookupUrl && (
                <a className="chip" href={cur.lookupUrl} target="_blank" rel="noreferrer">
                  Find this word in official ISLRTC dictionary ↗
                </a>
              )}
              <div className="flex w-full items-center gap-2 pt-2">
                <button className="btn-ghost" onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }}>‹</button>
                <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((idx + 1) / frames.length) * 100}%` }} /></div>
                <button className="btn-ghost" onClick={() => { setPlaying(false); setIdx((i) => Math.min(frames.length - 1, i + 1)); }}>›</button>
                <button className="btn-ghost" onClick={() => { if (idx >= frames.length - 1) setIdx(0); setPlaying(!playing); }}>{playing ? "❚❚" : "▶"}</button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Signs will appear here</p>
          )}
        </section>

        {frames.length > 0 && (
          <section className="rounded-2xl border bg-card p-4 space-y-2" aria-live="polite">
            <p className="text-sm font-semibold text-foreground">Original message (keep this visible)</p>
            <p className="text-lg text-foreground break-words">{text}</p>
            <p className="text-sm text-muted-foreground">This sequence is word-by-word assistance, not a validated ISL sentence. Grammar, negation, questions, names, and context may need a fluent signer.</p>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={slowPlayback} onChange={(e) => setSlowPlayback(e.target.checked)} />
              Slower playback
            </label>
          </section>
        )}

        <section className="space-y-3">
          <textarea className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={() => go()} disabled={!text.trim()}>Show in sign</button>
            <button className={listening ? "btn-mic btn-mic-on" : "btn-mic"} onClick={mic} disabled={!micOk} aria-label="Speak">{listening ? "■" : "🎤"}</button>
          </div>
          {!micOk && <p className="text-sm text-muted-foreground">Voice input isn't supported in this browser — try Chrome, or type instead.</p>}
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => <button key={q} className="chip" onClick={() => { setText(q); go(q); }}>{q}</button>)}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-2">
          <h2 className="text-xl font-display text-foreground">Explore the full official ISL dictionary</h2>
          <p className="text-sm text-muted-foreground">This project currently contains a small local set of linked dictionary clips. ISLRTC’s Government of India dictionary provides a much larger searchable collection, including everyday, academic, medical, legal, technical, and regional vocabulary.</p>
          <a className="btn-primary inline-flex items-center justify-center gap-2" href="https://divyangjan.depwd.gov.in/islrtc/" target="_blank" rel="noreferrer">Search official ISLRTC dictionary ↗</a>
          <p className="text-xs text-muted-foreground">The official dictionary opens separately. Its full catalogue is not automatically copied into this app, and only individually sourced clips are counted in the local dictionary.</p>
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-3">
          <div>
            <h2 className="text-xl font-display text-foreground">Additional official ISLRTC dictionary entries</h2>
            <p className="text-sm text-muted-foreground">Browse 24 more official dictionary entry pages. These open on the Government of India dictionary site; they are not counted as bundled local video clips unless separately imported and checked.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(OFFICIAL_ISL_LOOKUPS).map(([key, entry]) => (
              <a key={key} className="chip" href={entry.url} target="_blank" rel="noreferrer">{entry.label} ↗</a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-4">
          <div>
            <h2 className="text-xl font-display text-foreground">Everyday phrase library</h2>
            <p className="mt-1 text-sm text-muted-foreground">60 ready-to-practice messages across greetings, daily needs, health, and school. Select one to play it through the current dictionary/fingerspelling system.</p>
          </div>
          <input className="field" value={phraseQuery} onChange={(e) => setPhraseQuery(e.target.value)} placeholder="Search phrases…" aria-label="Search phrase library" />
          {visiblePhrases.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="font-semibold text-foreground">{group.title}</h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((phrase) => (
                  <button key={phrase} className="chip" onClick={() => { setText(phrase); go(phrase); }}>{phrase}</button>
                ))}
              </div>
            </div>
          ))}
          {visiblePhrases.length === 0 && <p className="text-sm text-muted-foreground">No matching phrases. Try “help”, “water”, or “school”.</p>}
          <p className="text-xs text-muted-foreground">These are practice messages, not verified sentence translations. Words without an individual dictionary entry are spelled out; ISL grammar and full-sentence signs require expert review.</p>
        </section>

        <details className="rounded-2xl border bg-card p-4">
          <summary className="cursor-pointer font-semibold text-foreground">Local dictionary clips ({new Set(Object.values(APPROVED_SIGNS).map((s) => s.word)).size} signs)</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...new Set(Object.values(APPROVED_SIGNS).map((s) => s.word))].map((w) => <span key={w} className="chip">{w}</span>)}
          </div>
        </details>
      </div>
    </main>
  );
}
