<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI gloss generation uses a public POST server function with bounded validated input and the AI Gateway SDK; messages are not stored because conversion is stateless.
- AI gloss clip matching is deterministic against dictionary-backed local entries only; model output cannot add video URLs or mark prototypes as verified.
- Keep AI gloss playback separate from experimental avatar playback so official clip matches are not replaced by illustrative or third-party motions.
