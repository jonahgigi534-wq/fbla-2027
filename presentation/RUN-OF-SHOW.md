# Setup and competition rules

This covers the mechanical side of the presentation: what to do in the three minute
setup, and the rules that carry their own points. The speaking is yours.

Everything here comes from the 2026-2027 event guidelines. Read them yourself as
well; this is a checklist, not a substitute.

---

## The rules that cost points

These are scored under Presentation Protocols, worth 10 points, and they are all
things you either do or do not do.

- **At most three personal devices.** Laptop, tablet, phone, or a monitor about the
  size of a laptop. Nothing else counts as allowed.
- **No projector in the preliminary round,** and you may not bring one. The final
  round may provide one.
- **No external speakers.** Audio has to come from the presenting device.
- **No interaction with judges during the three minute setup.** Not a word.
- **Links and QR codes may be shown but never clicked or scanned by judges.** Drive
  everything yourself.
- **Take everything with you.** Nothing may be left with the judges afterwards.
- **No food and no live animals.**
- **Dress code.** Five points come off for breaking it, and five more for being late.

**Electricity is not provided.** Plan the battery.

**Ask your adviser whether a power bank counts against the three device limit.** It is
the single best protection against a flat battery, and guessing wrong is a deduction.
Do not assume either way.

---

## Before you leave

- [ ] `npm run check` passes
- [ ] `npm run build` has been run, and `dist/standalone.html` opens **with the wifi
      off** by double clicking it
- [ ] The same file opens in a second browser and in a guest profile, in case an
      extension on the presenting laptop interferes
- [ ] Laptop charged to 100 percent, and charged again the morning of
- [ ] **Battery saver off.** It throttles and dims the screen, which is the opposite of
      what you want with three people reading one display
- [ ] Sleep and screensaver disabled
- [ ] Do Not Disturb on. A notification popping up mid demonstration costs poise
- [ ] Screen brightness high enough for three judges around one laptop
- [ ] A backup copy of `dist/` on a second device and on a USB stick
- [ ] Printed one-pager, if you want one. Paper costs no device slot and no battery

---

## The three minute setup

Silent. No talking to judges. Practice it with a timer until it fits comfortably.

1. Laptop out, lid open, plugged into nothing.
2. Close every other application. Airplane mode on, so nothing can interrupt and
   nothing can be blamed on the venue wifi.
3. Open `dist/standalone.html`.
4. **Reset demo data**: Staff, PIN 1967, Reset demo data. This puts the program back
   to a fresh install and rebuilds the ninety days of history, so the previous round
   leaves no trace.
5. Navigate back to the home screen and leave it there.
6. If you plan to show the code or the test run, open those windows now and size them.
   Turn the terminal font up. Judges are looking at a laptop screen from the far side
   of a table.
7. Stand ready. Do not touch anything else.

---

## Things worth knowing while presenting

**The staff PIN is 1967.** It is printed on the screen that asks for it, on purpose,
so a judge who wanders into the staff area is never stuck.

**Reset demo data** is under Staff. Use it between rounds.

**A judge may ask to try it themselves.** Let them. The program is built to survive
it: every screen has a way out, unknown addresses land on a real Not Found page, and
one click puts everything back.

**If something goes wrong**, the fastest recovery is to reload the page. Saved state
survives a reload, and the program returns to the screen it was on.

---

## Seven minutes is short

There are roughly fifteen demonstrable features here and time for about six. Decide in
advance which ones, and deliberately hold the rest back for the question round, where
answers that go beyond what was shown are worth points of their own.

`npm run check` runs in about half a second and prints 225 passing tests plus three
clean checks. If you want one moment that separates this from a website, that is
probably it.
