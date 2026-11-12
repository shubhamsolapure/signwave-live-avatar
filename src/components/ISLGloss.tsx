import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, LoaderCircle, Pause, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateISLGloss } from "@/lib/isl-gloss.functions";
import type { GlossResult } from "@/lib/isl-gloss";

export default function ISLGloss({ message }: { message: string }) {
  const generate = useServerFn(generateISLGloss);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GlossResult | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const requestRef = useRef(0);
  const busyRef = useRef(false);
  const current = result?.sequence[active];
  const stale = result !== null && result.message !== message.trim();
  const unsupported = result?.sequence.filter((item) => !item.video) ?? [];

  useEffect(() => {
    if (stale) setPlaying(false);
  }, [stale]);

  useEffect(() => {
    if (!playing || !current || !result) return;
    // Unsupported concepts stop playback rather than silently skipping meaning.
    if (!current.video || active === result.sequence.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setActive((i) => i + 1), 7000);
    return () => clearTimeout(timer);
  }, [playing, active, current, result]);

  async function convert() {
    if (busyRef.current || !message.trim()) return;
    busyRef.current = true;
    const request = ++requestRef.current;
    setBusy(true);
    setError("");
    setPlaying(false);
    try {
      const response = await generate({ data: { message: message.trim() } });
      if (request !== requestRef.current) return;
      if (response.error || !response.result) { setError(response.error ?? "No gloss was returned."); return; }
      setResult(response.result);
      setActive(0);
    } catch {
      setError("AI conversion could not be reached. Your message and previous result are unchanged.");
    } finally {
      if (request === requestRef.current) { busyRef.current = false; setBusy(false); }
    }
  }

  return (
    <section className="space-y-4 border-t pt-5" aria-labelledby="ai-gloss-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ai-gloss-title" className="font-display text-xl text-foreground">AI-assisted ISL gloss</h2>
        <span className="text-xs text-muted-foreground">AI Gateway · draft, not verified ISL</span>
      </div>
      <Button type="button" size="lg" className="h-auto min-h-10 w-full whitespace-normal" onClick={convert} disabled={busy || !message.trim() || message.trim().length > 1000}>
        {busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
        {busy ? "Converting message…" : "Create ISL gloss"}
      </Button>
      {message.trim().length > 1000 && <p role="alert" className="text-sm text-destructive">Please shorten the message to 1,000 characters for AI conversion.</p>}
      {busy && <p role="status" className="text-sm text-muted-foreground">Preparing a gloss and checking available official clips…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-4" aria-live="polite">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Original message</p>
            <p className="break-words text-foreground">{result.message}</p>
          </div>
          {stale && <p role="status" className="text-sm text-destructive">Message changed. This gloss belongs to the previous message.</p>}
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Gloss sequence</p>
            <ol className="flex flex-wrap gap-2" aria-label="ISL gloss sequence">
              {result.sequence.map((item, i) => (
                <li key={`${i}-${item.gloss}`} className="min-w-0 max-w-full">
                  <Button variant={i === active ? "secondary" : "outline"} className="h-auto min-h-10 max-w-full whitespace-normal text-left" onClick={() => { setPlaying(false); setActive(i); }} aria-pressed={i === active} title={item.video ? "Official ISLRTC clip available" : "Unsupported sign — fingerspelling required"}>
                    {item.video ? <Check className="text-success" /> : <AlertTriangle className="text-destructive" />}
                    <span className="break-words">{i + 1}. {item.gloss}</span>
                  </Button>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm text-muted-foreground">{result.sequence.length - unsupported.length} clip matches · {unsupported.length} unsupported signs</p>
          {unsupported.length > 0 && <p className="break-words text-sm text-destructive">Unsupported: {[...new Set(unsupported.map((item) => item.gloss))].join(", ")}. No official word clip is mapped; fingerspell these concepts rather than guess a sign.</p>}
          {current && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">{active + 1}/{result.sequence.length} · {current.gloss}</h3>
              <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                {current.video ? <iframe key={current.video + active} className="h-full w-full" title={`AI gloss official ISLRTC clip: ${current.gloss}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen src={`https://www.youtube-nocookie.com/embed/${current.video}?autoplay=1&mute=1&controls=1&rel=0&playsinline=1`} />
                  : <div className="flex h-full flex-col items-center justify-center gap-2 overflow-auto p-4 text-center">
                    <AlertTriangle className="text-destructive" />
                    <p className="font-semibold text-foreground">Unsupported sign · {current.gloss}</p>
                    <p className="break-words font-mono text-lg text-foreground">{current.letters.join(" · ")}</p>
                    <p className="text-sm text-muted-foreground">Fingerspelling needed · no invented gesture</p>
                  </div>}
              </div>
              {current.video && <Button asChild variant="link" className="h-auto whitespace-normal px-0"><a href={`https://www.youtube.com/watch?v=${current.video}`} target="_blank" rel="noreferrer">Open official ISLRTC clip ↗</a></Button>}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" aria-label="Previous gloss" disabled={active === 0} onClick={() => { setPlaying(false); setActive((i) => i - 1); }}><ChevronLeft /></Button>
                <Button variant="outline" size="icon" aria-label={playing ? "Pause gloss sequence" : "Play gloss sequence"} disabled={!current.video || stale} onClick={() => { if (active === result.sequence.length - 1) setActive(0); setPlaying(!playing); }}>{playing ? <Pause /> : <Play />}</Button>
                <Button variant="outline" size="icon" aria-label="Next gloss" disabled={active === result.sequence.length - 1} onClick={() => { setPlaying(false); setActive((i) => i + 1); }}><ChevronRight /></Button>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">AI gloss is a draft, not a verified sentence translation. Official clips do not validate the complete message. Confirm meaning with a fluent ISL signer, especially for health or safety.</p>
          {result.notes.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{result.notes.map((note, i) => <li key={i}>{note}</li>)}</ul>}
        </div>
      )}
    </section>
  );
}