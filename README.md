# Signwave Live Avatar

https://isl-translator-demo--33hxkov2.preview.emergentagent.com/. This is prototype you have to make it complete by making it verified translator and deaf should understand the sign language by voice or typing

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://signwave-live-avatar.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5583201e-ca0b-4619-bc70-d87a3b56374f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## ISL accuracy and accessibility status

This project is a prototype, **not a certified or validated automatic ISL interpreter**. A dictionary clip is a reference for an individual sign, not proof that a complete sentence is correct. Sentence-level ISL requires Deaf-led review of grammar, facial expression, head movement, spatial references, and regional variation.

### This update
- Preserves English grammatical words instead of silently dropping them.
- Uses fingerspelling as a fallback for unsupported words rather than guessing a sign.
- Keeps the original message visible for context and review.
- Adds slower playback for reviewing each step.
- Clearly labels the output as word-by-word assistance, not validated ISL sentence translation.

### Before real-world reliance
1. Ask Deaf ISL users and qualified interpreters to verify every clip, meaning, handedness, and regional variant.
2. Build a reviewed phrase/sentence dataset with sources, licensing, signer videos or motion capture, and reviewer status.
3. Add ISL grammar and non-manual features; do not create grammar by deleting English filler words.
4. Test comprehension with Deaf participants using consented scenarios and measure meaning accuracy.
5. Keep the original text visible and disclose uncertainty until validation is complete.

Do not rely on this prototype as the sole channel for emergency, medical, legal, or other high-stakes communication.
