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

- [ ] `npm run check` passes **on the presenting laptop itself**, which also proves Node
      is installed there. With airplane mode on there is no way to install it on the day
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
6. Get the code ready for the segment under **Showing the code** below: editor font at
   24 to 28 point, every tab closed except `domain/pricing.js`, the explorer collapsed
   to the four folders in `src/js`, the minimap off, and a terminal in the project
   folder with `npm run check` typed but not run. Judges are looking at a laptop screen
   from the far side of a table, so angle it toward them for that part.
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

---

## Showing the code

Nobody sees the code before the event. The rating sheet gives twenty points to the code
itself, ten for comments, naming, and formatting and ten for modular structure, and the
only evidence the judges get for either is what is shown in the room. Ninety seconds is
enough. It goes straight after the live demonstration, as the step from what the
program does to how it is built.

1. **Help → Programming concepts**, fifteen seconds. Every concept the topic names is
   matched to a file and a function. _"Everything the topic asks us to show is mapped
   here. Let me open one."_
2. **The folders**, fifteen seconds. Switch to the editor with `src/js` open one level:
   `data`, `domain`, `app`, `ui`. Four folders with one job each, and the logic never
   reaches into the screens, which a script checks. This is modular structure.
3. **`domain/pricing.js`**, thirty seconds. It is the file the Variables row points at.
   Point at the numbered steps in the comment at the top, then at `subtotal`,
   `discount`, `goods`, `tax`, and `tip` inside `calculateOrderTotals`. The comments say
   why rather than what: the discount comes off before tax, because taxing first
   overcharges the customer. Each step is its own named variable, so the arithmetic
   reads top to bottom. This is comments, naming, and formatting.
4. **`npm run check`**, twenty seconds. It is already typed, so it takes one keypress.
   Read the test count off the screen rather than quoting one from memory, then name the
   four checks: every function documented, the layers kept apart, nothing misspelled,
   and every figure in the documentation still true. If you want one moment that
   separates this from a website, it is this one.

Then back to the program, or to the closing slide.

**Never open `dist/standalone.html` in the editor.** It is the whole program bundled
into one file so it can run offline. A judge who sees it will reasonably conclude the
code is one file, which undoes step 2.

**Stay out of `data/`.** The menu files are long lists of items and read as noise.

**No code on slides.** A screenshot of code is unreadable across a table, and the real
thing running is more convincing.

### In the question round

Know these by name, so any of them opens in a couple of seconds with Ctrl+P in VS Code:

| If the question is about | Open                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| Totals, tax, money       | `domain/pricing.js`                                                  |
| Validation               | `domain/validation.js` for shape, `domain/orderRules.js` for meaning |
| The Pie Assistant        | `domain/assistant.js`                                                |
| Reports                  | `domain/reports.js`                                                  |
| How it is organized      | the `src/js` folder                                                  |

**Expect "did you write all this?"** It is a fair question at an introductory event,
about a program this size. The answer that lands is opening a file and explaining it
without notes, so practice exactly that, on `pricing.js` and on one other file.
