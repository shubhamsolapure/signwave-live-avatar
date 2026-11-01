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

type Frame = { label: string; big: string; how: string; verified: boolean; validatedAnimation: boolean; word: string | null; video: string | null; lookupUrl: string | null };

function toFrames(steps: Step[]): Frame[] {
  return steps.flatMap((s): Frame[] =>
    s.kind === "sign"
      ? [{ label: s.sign.word, big: s.sign.emoji, how: s.sign.how, verified: Boolean(s.sign.video), validatedAnimation: s.sign.validatedAnimation === true, word: s.sign.word, video: s.sign.video || null, lookupUrl: s.sign.video ? null : "https://divyangjan.depwd.gov.in/islrtc/" }]
      : s.letters.map((l, i) => ({
          label: `Spell "${s.source}" · ${i + 1}/${s.letters.length}`,
          big: l,
          how: `Fingerspell the letter ${l} with ISL two-hand alphabet.`,
          verified: false,
          validatedAnimation: false,
          word: null,
          video: null,
          lookupUrl: `https://www.youtube.com/@islrtcnewdelhi4069/search?query=${encodeURIComponent(s.source)}`,
        })),
  );
}

function Index() {
  const [text, setText] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [mode, setMode] = useState<"hybrid" | "avatar">("hybrid");
  const [micOk, setMicOk] = useState(true);
  const [voiceError, setVoiceError] = useState("");
  const [slowPlayback, setSlowPlayback] = useState(false);
  const [phraseQuery, setPhraseQuery] = useState("");
  const [officialQuery, setOfficialQuery] = useState("");
  const recRef = useRef<any>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setMicOk(false);
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e: any) => {
      const results = Array.from(e.results as ArrayLike<any>);
      const transcript = results.map((x: any) => x[0]?.transcript ?? "").join(" ").replace(/\\s+/g, " ").trim();
      transcriptRef.current = transcript;
      setText(transcript);
    };
    r.onerror = (e: any) => {
      setVoiceError(e?.error === "not-allowed" ? "Microphone access was blocked. Allow microphone access in your browser settings." : `Voice input error: ${e?.error ?? "please try again"}.`);
      setListening(false);
    };
    r.onend = () => {
      setListening(false);
      // Prefer the recognizer's transcript over querying the first textarea in the DOM.
      const finalText = transcriptRef.current.trim() ||
        (document.querySelector("textarea") as HTMLTextAreaElement | null)?.value?.trim() || "";
      if (finalText) go(finalText);
      else setVoiceError("No speech was detected. Try again or type your message.");
    };
    recRef.current = r;
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (idx >= frames.length - 1) return setPlaying(false);
    const t = setTimeout(() => setIdx((i) => i + 1), (frames[idx]?.verified ? (mode === "hybrid" && !frames[idx]?.validatedAnimation ? 5000 : 2200) : 1100) * (slowPlayback ? 1.8 : 1));
    return () => clearTimeout(t);
  }, [playing, idx, frames, mode, slowPlayback]);

  const go = (t = text) => {
    setVoiceError("");
    const f = toFrames(translate(t));
    setFrames(f);
    setIdx(0);
    setPlaying(f.length > 0);
  };

  const mic = () => {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); return; }
    setVoiceError("");
    transcriptRef.current = "";
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      setVoiceError("Voice input could not start. Stop any active recording and try again.");
    }
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

  // Clear badge text based on status
  const badgeText = (() => {
    if (mode === "hybrid" && cur?.validatedAnimation) return "✅ ISL animation reviewed and validated";
    if (mode === "hybrid" && cur?.video) return "📹 Official reference video · 3D sign not yet validated";
    if (mode === "avatar" && cur?.word && cur?.video) return "⚠️ Experimental 3D gesture · NOT validated ISL";
    if (mode === "avatar" && cur?.word) return "⚠️ Experimental 3D gesture · NOT verified ISL";
    return "🔤 Fingerspelling · handshape not validated";
  })();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Saanjh</p>
          <h1 className="font-display text-4xl leading-tight text-foreground">Speak or type.<br />See it in sign.</h1>
          <p className="mt-2 text-muted-foreground">The full-body 3D avatar has a procedural two-hand rig with individually articulated fingers. Its movements are illustrative prototypes, not motion-captured or expert-validated ISL. Official dictionary clips are linked where available; sentence grammar and fingerspelling still need expert review.</p>
        </header>

        <div className="mode-toggle" role="tablist">
          <button className={mode === "hybrid" ? "mode-on" : "mode-off"} onClick={() => setMode("hybrid")}>Hybrid · verified-first</button>
          <button className={mode === "avatar" ? "mode-on" : "mode-off"} onClick={() => setMode("avatar")}>Experimental 3D avatar</button>
        </div>
        <div className="avatar-frame">
          {mode === "hybrid" && !cur?.validatedAnimation ? (
            cur?.video ? (
              <div className="relative h-full w-full">
                <iframe key={cur.video} className="h-full w-full" title={`ISL sign: ${cur.label}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen
                  src={`https://www.youtube-nocookie.com/embed/${cur.video}?autoplay=1&mute=1&loop=1&playlist=${cur.video}&controls=1&rel=0&modestbranding=1&playsinline=1`} />
                <a className="absolute bottom-2 right-2 rounded-full bg-background/95 px-3 py-2 text-xs font-semibold text-foreground shadow" href={`https://www.youtube.com/watch?v=${cur.video}`} target="_blank" rel="noreferrer">Video not loading? Open on YouTube ↗</a>
              </div>
            ) : cur ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                <span className="font-display text-6xl text-foreground">{cur.big}</span>
                <p className="font-semibold text-foreground">Look up “{cur.word ?? cur.label}” in the official dictionary</p>
                <p className="max-w-md text-sm text-muted-foreground">This word does not have a locally verified dictionary video. Search the full ISLRTC collection for its official video and any alternate meanings.</p>
                <form className="flex w-full max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); const term = (officialQuery.trim() || cur.word || cur.label).replace(/^Spell ["“]|["”] ·.*$/g, "").trim(); if (term) window.open(`https://www.youtube.com/@islrtcnewdelhi4069/search?query=${encodeURIComponent(term)}`, "_blank", "noopener,noreferrer"); }}>
                  <input className="field min-w-0 flex-1" value={officialQuery || cur.word || cur.label} onChange={(e) => setOfficialQuery(e.target.value)} aria-label="Search official ISLRTC sign videos" placeholder="Search a word or phrase…" />
                  <button className="btn-primary" type="submit">Find videos ↗</button>
                </form>
                <a className="chip" href={`https://www.youtube.com/@islrtcnewdelhi4069/search?query=${encodeURIComponent(cur.word || cur.label)}`} target="_blank" rel="noreferrer">Search this word in ISLRTC videos ↗</a>
                <a className="chip" href={`https://www.google.com/search?q=${encodeURIComponent(`site:divyangjan.depwd.gov.in/islrtc ${cur.word || cur.label}`)}`} target="_blank" rel="noreferrer">Search official dictionary entries for this word ↗</a>
                <a className="chip" href="https://divyangjan.depwd.gov.in/islrtc/" target="_blank" rel="noreferrer">Open official dictionary website ↗</a>
                <p className="max-w-md text-xs text-muted-foreground">Search opens results on the ISLRTC YouTube channel. Choose the relevant meaning and check that the video is from ISLRTC; a word may have several signs. External search results cannot be guaranteed or embedded automatically.</p>
              </div>
            ) : (
              <div className="grid h-full place-items-center p-6 text-center text-muted-foreground">Select a message to explore a dictionary clip or an illustrative 3D gesture</div>
            )
          ) : (
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <Signer3D word={cur?.word ?? null} spelling={!!cur && !cur.word} letter={cur?.big} />
            </Suspense>
          </ClientOnly>
          )}
          {mode === "avatar" && cur && !cur.word && <span className="avatar-letter">{cur.big}</span>}
        </div>

        <section className="stage" aria-live="polite">
          {cur ? (
            <>
              <span className={(mode === "hybrid" && cur.validatedAnimation) || (mode === "hybrid" && cur.video) ? "badge-verified" : "badge-spell"}>{badgeText}</span>
              <div className="key-in text-5xl font-display" key={idx}>{cur.big}</div>
              <p className="text-2xl font-display text-foreground">{cur.label}</p>
              {mode === "avatar" && cur.video && (
                <button
                  className="btn-primary mt-2"
                  onClick={() => setMode("real")}
                  aria-label={`Watch official ISLRTC reference for ${cur.label}`}
                >
                  Watch official ISL reference for “{cur.label}” ↗
                </button>
              )}
              {mode === "avatar" && cur.word && (
                <p className="text-xs text-muted-foreground">
                  The 3D movement is experimental and is not a validated ISL translation. Use the official reference video to confirm the handshape, orientation, location and movement.
                </p>
              )}
              {(mode === "avatar" || !cur.video) && <p className="text-muted-foreground">{cur.how}</p>}
              {cur.lookupUrl && (
                <a className="chip" href={cur.lookupUrl} target="_blank" rel="noreferrer">
                  Find this word in official ISLRTC dictionary ↗
                </a>
              )}
              <div className="flex w-full items-center gap-2 pt-2">
                <button className="btn-ghost" onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }} aria-label="Previous">‹</button>
                <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((idx + 1) / frames.length) * 100}%` }} /></div>
                <button className="btn-ghost" onClick={() => { setPlaying(false); setIdx((i) => Math.min(frames.length - 1, i + 1)); }} aria-label="Next">›</button>
                <button className="btn-ghost" onClick={() => { if (idx >= frames.length - 1) setIdx(0); setPlaying(!playing); }} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
                <button className="btn-ghost" onClick={() => { setIdx(0); setPlaying(true); }} aria-label="Play again">↻</button>
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
            <a className="chip inline-flex" href={`https://www.youtube.com/@islrtcnewdelhi4069/search?query=${encodeURIComponent(text.trim())}`} target="_blank" rel="noreferrer">Search official ISLRTC videos for the whole message ↗</a>
            <a className="chip inline-flex" href={`https://www.google.com/search?q=${encodeURIComponent(`site:divyangjan.depwd.gov.in/islrtc ${text.trim()}`)}`} target="_blank" rel="noreferrer">Search official dictionary entries for the whole message ↗</a>
            <p className="text-xs text-muted-foreground">If there is no exact sentence result, search important words separately. ISL does not always follow English word order.</p>
            <label className="flex items-center gap-2 text-sm text-foreground font-medium">
              <input type="checkbox" checked={slowPlayback} onChange={(e) => setSlowPlayback(e.target.checked)} />
              Slow playback (recommended for learning)
            </label>
          </section>
        )}

        <section className="space-y-3">
          <textarea className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
          {voiceError && <p role="alert" className="text-sm text-destructive">{voiceError}</p>}
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={() => go()} disabled={!text.trim()}>Translate text to sign</button>
            <button className={listening ? "btn-mic btn-mic-on" : "btn-mic"} onClick={mic} disabled={!micOk} aria-label="Speak">{listening ? "■" : "🎤"}</button>
          </div>
          {!micOk && <p className="text-sm text-muted-foreground">Voice input is not supported in this browser. Try Chrome or type your message instead.</p>}
          {micOk && <p className="text-xs text-muted-foreground">Voice recognition uses your browser speech service (English–India). Microphone permission and an internet connection may be required.</p>}
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
