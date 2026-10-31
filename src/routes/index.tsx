import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { translate, APPROVED_SIGNS, type Step } from "@/lib/isl";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saanjh — Voice & Text to Indian Sign Language" },
      { name: "description", content: "Speak or type and see verified Indian Sign Language signs, with fingerspelling for everything else." },
      { property: "og:title", content: "Saanjh — Voice & Text to ISL" },
      { property: "og:description", content: "Verified ISL signs from speech or text for deaf communication." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Frame = { label: string; big: string; how: string; verified: boolean };

function toFrames(steps: Step[]): Frame[] {
  return steps.flatMap((s) =>
    s.kind === "sign"
      ? [{ label: s.sign.word, big: s.sign.emoji, how: s.sign.how, verified: true }]
      : s.letters.map((l, i) => ({
          label: `Spell "${s.source}" · ${i + 1}/${s.letters.length}`,
          big: l,
          how: `Fingerspell the letter ${l} with ISL two-hand alphabet.`,
          verified: false,
        })),
  );
}

function Index() {
  const [text, setText] = useState("");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [micOk, setMicOk] = useState(true);
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
    const t = setTimeout(() => setIdx((i) => i + 1), frames[idx]?.verified ? 2200 : 1100);
    return () => clearTimeout(t);
  }, [playing, idx, frames]);

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
  const quick = ["Hello, what is your name?", "I need help, call doctor", "Thank you friend"];

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Saanjh</p>
          <h1 className="font-display text-4xl leading-tight text-foreground">Speak or type.<br />See it in sign.</h1>
          <p className="mt-2 text-muted-foreground">Indian Sign Language from verified signs only. Unknown words are fingerspelled — never guessed.</p>
        </header>

        <section className="stage" aria-live="polite">
          {cur ? (
            <>
              <span className={cur.verified ? "badge-verified" : "badge-spell"}>{cur.verified ? "✓ Verified sign" : "Fingerspelling"}</span>
              <div className="key-in text-8xl font-display" key={idx}>{cur.big}</div>
              <p className="text-2xl font-display text-foreground">{cur.label}</p>
              <p className="text-muted-foreground">{cur.how}</p>
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

        <details className="rounded-2xl border bg-card p-4">
          <summary className="cursor-pointer font-semibold text-foreground">Verified sign dictionary ({new Set(Object.values(APPROVED_SIGNS).map((s) => s.word)).size} signs)</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...new Set(Object.values(APPROVED_SIGNS).map((s) => s.word))].map((w) => <span key={w} className="chip">{w}</span>)}
          </div>
        </details>
      </div>
    </main>
  );
}
