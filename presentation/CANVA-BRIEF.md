# Canva brief

Everything needed to build the slide deck for the House of Pies ordering system, written
so an AI assistant (Claude Cowork) can build it in Canva without asking anything else.
The team's own notes on the day are in [RUN-OF-SHOW.md](RUN-OF-SHOW.md), and answers for
the question round are in [QA-FACT-SHEET.md](QA-FACT-SHEET.md).

## Setup, done once by a person

1. Open the Claude desktop app and start a Cowork task.
2. Give it this folder: `C:\Users\jonah\Documents\fbla-2027`.
3. Turn on the Canva connector (Settings, then Connectors, then Canva) and sign in with
   the Canva account the deck will be presented from.
4. Drag the whole `presentation/canva` folder into Canva's Uploads, so every image is
   already in the account. The connector may not be able to upload files from the
   computer by itself, and this takes ten seconds.
5. Paste the prompt below.

No GitHub connector is needed. The repository is private, and everything is already in
the local folder.

## The prompt to paste into Cowork

> Read `presentation/CANVA-BRIEF.md` in the folder I shared and build the slide deck it
> describes in Canva, using the images in `presentation/canva` (they are also in my Canva
> uploads). Follow the slide plan, the facts, and the rules in that file exactly. Do not
> invent features or numbers. Where it says a screenshot comes from the team, leave a
> clearly labeled placeholder. When you are done, list anything you could not do.

## What the project is

A web ordering system for House of Pies, a family owned Houston restaurant and bakery
open since 1967, with six locations. Customers browse the real menu, order for pickup,
delivery, or dine in, and track their orders. Staff manage the order queue, stock, and
sales reports. It was built for the FBLA 2026-2027 Introduction to Programming event,
whose topic is a digital ordering system for a local business.

It is plain HTML, CSS, and JavaScript with no frameworks or libraries, and it runs offline
from one file. An optional AI assistant uses the internet when it is available.

## The presentation

Seven minutes in total, then questions from the judges.

| Part                          | Time       | Who does it                      |
| ----------------------------- | ---------- | -------------------------------- |
| Slides 1 and 2                | 0:30       | Slides                           |
| Live demonstration of the app | about 2:30 | The team, in the app, not slides |
| Slides 4 to 13                | about 4:00 | Slides                           |

Judges never see the code or the repository before the event, so the slides are the only
place they see the code, the structure, and the documentation. Every rubric item below
that is not shown in the live demo has to be on a slide.

## Rubric, and where each item is earned

| Rubric item                                          | Earned in           |
| ---------------------------------------------------- | ------------------- |
| Code: comments, naming, formatting                   | Slide 6             |
| Code: modular structure                              | Slide 5             |
| Intuitive interface and clear instructions           | Live demo, slide 11 |
| Interactive help menu                                | Slide 11            |
| No spelling errors, no navigation errors             | Slide 10            |
| An intelligent feature                               | Live demo, slide 8  |
| Input validation, syntactic and semantic             | Live demo, slide 7  |
| Addresses every part of the topic, correlation shown | Slide 4             |
| A report the user can customize and analyze          | Live demo, slide 9  |
| Data storage                                         | Slide 9             |
| Documentation: readme, libraries, credits            | Slide 12            |

## Slide plan

Each slide lists what goes on it, which image to use, and what the speaker says. Keep the
words on the slide short. The speaker notes carry the detail and belong in Canva's notes
field, not on the slide.

### 1. Title

- On the slide: House of Pies Ordering. FBLA Introduction to Programming 2026-2027.
  [Team member names], [School], [Chapter].
- Image: `app-02-home.png` as a large background or side image.
- Speaker: who we are and what we built, in one sentence.

### 2. The business

- On the slide: six Houston area restaurants since 1967. Customers order ahead; staff run
  the counter. Our topic: a digital ordering system for a local business.
- Image: `app-12-locations-hours.png`.
- Speaker: why a real local business, and who uses each side of the program.

### 3. Live demo

- On the slide: "Live demo" and nothing else. The team switches to the app here.

### 4. How we covered the topic

- On the slide: this table, built as a Canva table rather than an image.

| The topic asks for       | Where it is in our program                                            |
| ------------------------ | --------------------------------------------------------------------- |
| Products or services     | 355 food, drink, and bakery items, plus 71 catering items             |
| Place and manage orders  | Track, edit item by item, cancel, reorder, print a receipt            |
| Calculate totals         | Money kept in whole cents, discount taken off before tax              |
| Review order information | Receipts, order history, and a spending summary                       |
| Unavailable items        | Sold out items stay listed and suggest substitutes                    |
| Inventory limits         | Stock is checked against what is already in the cart                  |
| Invalid entries          | Every input checked for shape, then for whether it fits the order     |
| Budget constraints       | A spending limit that warns, blocks checkout, and says what to remove |
| Helping the business     | Pickup slots capped so the counter does not back up                   |

- Speaker: walk down the left column quickly; this is the slide that shows every part of
  the topic is answered.

### 5. How the code is organized

- On the slide: four folders, one job each. The logic never imports from the screens, and
  a script checks it. 78 JavaScript files, none over 400 lines.
- Image: `code-09-folder-structure.png`.
- Speaker: data holds the menu and locations, domain is the logic, app is routing and
  saving, ui is the screens. Keeping the logic apart is why all of it can be tested.

### 6. Comments and naming

- On the slide: comments explain why, not what. Each step is its own named variable.
- Images: `code-01-pricing-steps.png` and `code-02-pricing-function.png`.
- Speaker: the numbered steps at the top of pricing.js are followed in order in the
  function. The comment says why the discount comes off before tax: taxing first would
  overcharge the customer. Names like subtotal, discount, goods, and tax make the math
  readable top to bottom. All code is formatted the same way by Prettier.

### 7. Two levels of validation

- On the slide: same ZIP code, two checks. Shape: is it five digits? Meaning: does this
  restaurant deliver there?
- Images: `code-03-validate-zip-shape.png` and `code-04-zip-delivery-area.png` side by
  side. Optional small inset: `app-07-checkout-shape-errors.png`.
- Speaker: every input is checked twice, and each check has its own message. Other
  checked inputs: card number and expiry, phone, email, pickup time, quantity against
  stock, spending limit (`app-05-limit-below-cart-refused.png` shows a limit refused
  because the cart already costs more), stock edits, and report dates.

### 8. The Pie Assistant (intelligent feature)

- On the slide: ask in plain English. With internet it uses Llama 3.3, given the live
  menu, stock, and cart. Without internet it answers from the device and still copes with
  typos. Nothing personal is ever sent.
- Images: `app-09-assistant.png`, and `code-08-assistant-typos.png` smaller.
- Speaker: the AI gets rules first: answer about the restaurant only from our facts, never
  invent a price, never call anything gluten free. The offline matcher has a knowledge
  base of 17 intents and treats a word one typo away as a match.
- Team placeholder: a screenshot of an AI answer from a laptop with the key saved.

### 9. Data and reports

- On the slide: data storage and reports.
  - 426 menu items held as a list of objects; orders and carts as lists.
  - Saved in the browser, with a fallback when saving is blocked.
  - Money in whole cents. 90 days of order history generated from a fixed seed.
  - Reports: 7 groupings, 4 measures, compared with the period before, CSV export.
- Images: team placeholder for a Reports screenshot (Staff, PIN 1967, Reports, grouped by
  restaurant), plus `code-07-report-percent-change.png` or `code-05-money-round-cents.png`.
- Speaker: why cents (floating point gives totals like 24.310000000000002), and why the
  report compares with the previous period (a number means little on its own).

### 10. Quality checks

- On the slide: one command checks everything.
- Image: `code-10-npm-run-check.png`. Optional small inset: `app-11-not-found.png`.
- Speaker: 287 automated tests, every function documented, every word on screen spell
  checked, the folder rule enforced, and the numbers in our docs checked against the
  code. Unknown addresses land on a real Not Found page, so there are no dead ends.

### 11. Help and instructions

- On the slide: a quick tour on the first visit, a searchable help center, and an
  instruction on every empty screen.
- Images: `app-01-welcome-tour.png` and `app-10-help-center.png`.
- Speaker: a new user is shown around in five steps, and can search the guides any time.
- If time is short, merge this slide into slide 10.

### 12. Documentation and credits

- On the slide:
  - Readme with how to run it, plus guides: user guide, architecture, testing, code style.
  - Libraries: none at runtime. Prettier for formatting while coding. Llama 3.3 through
    OpenRouter for the optional AI. Bebas Neue and Parkinsans fonts, bundled.
  - No templates were used.
  - Credits: the House of Pies name, logo, photos, menu, and guest reviews belong to
    House of Pies. Not affiliated with or endorsed by them.
- Images: team placeholder for a screenshot of the readme on GitHub. `docs/images/home.png`
  is the screenshot the readme itself shows, if needed.

### 13. Thank you

- On the slide: Thank you. Questions?
- Image: the House of Pies logo, `assets/img/logo.webp`, or `app-02-home.png`.

## Facts that may be quoted

Every figure here was checked against the code. Do not use any other numbers.

| Fact                            | Value                                              |
| ------------------------------- | -------------------------------------------------- |
| Menu                            | 426 menu items across 34 categories                |
| Catering items, 48 hours notice | 71                                                 |
| Restaurants                     | 6                                                  |
| Sold out on the real menu       | 11 items are sold out                              |
| Report groupings and measures   | 7 and 4                                            |
| Order history                   | 90 days                                            |
| Pickup slots                    | every 15 minutes, 4 orders each                    |
| Sales tax                       | 8.25 percent, charged after any discount           |
| Promo codes                     | 4                                                  |
| Tests                           | 287, all passing                                   |
| JavaScript modules              | 78                                                 |
| Functions, all documented       | 303                                                |
| Longest file                    | under 400 lines                                    |
| Offline assistant               | 17 intents, 38 phrasings and 8 misspellings tested |
| AI model                        | Llama 3.3 70B through OpenRouter                   |
| Runtime libraries               | none                                               |
| Staff PIN for the demo          | 1967                                               |

## Look and feel

Match the app so the deck and the demo feel like one thing.

| Use for     | Value                              |
| ----------- | ---------------------------------- |
| Headings    | Bebas Neue, all caps               |
| Body text   | Parkinsans (or a clean sans serif) |
| Main accent | Orange `#d35c00`, darker `#a94a00` |
| Text        | Dark brown `#150303`               |
| Background  | Cream `#faf9f6`, cards in white    |
| Soft accent | Light orange `#fbe8d8`             |

The code images are dark on purpose, so they read as code. Put them on a cream slide with
plenty of space around them, and never shrink one below half the slide width.

## Images in `presentation/canva`

| File                                  | Shows                                                        |
| ------------------------------------- | ------------------------------------------------------------ |
| `app-01-welcome-tour.png`             | The first visit tour, step 1 of 5                            |
| `app-02-home.png`                     | Home screen with the six restaurants                         |
| `app-03-menu-vegetarian.png`          | Menu filtered to vegetarian, with sold out items labeled     |
| `app-04-sold-out-substitutes.png`     | A sold out item offering substitutes                         |
| `app-05-limit-below-cart-refused.png` | A spending limit refused because the cart already costs more |
| `app-06-over-spending-limit.png`      | Over the limit: checkout blocked, item to remove suggested   |
| `app-07-checkout-shape-errors.png`    | Checkout with a message under every badly typed field        |
| `app-08-receipt.png`                  | A receipt with the order tracker                             |
| `app-09-assistant.png`                | The Pie Assistant answering a question                       |
| `app-10-help-center.png`              | Help center search                                           |
| `app-11-not-found.png`                | Not Found page for a bad address                             |
| `app-12-locations-hours.png`          | The six locations                                            |
| `code-01-pricing-steps.png`           | pricing.js: the numbered steps and why                       |
| `code-02-pricing-function.png`        | pricing.js: the named steps in code                          |
| `code-03-validate-zip-shape.png`      | validation.js: is the ZIP five digits                        |
| `code-04-zip-delivery-area.png`       | orderRules.js: does this restaurant deliver there            |
| `code-05-money-round-cents.png`       | money.js: whole cents, and rounding                          |
| `code-06-search-whole-words.png`      | search.js: whole word matching                               |
| `code-07-report-percent-change.png`   | reports.js: change from the previous period                  |
| `code-08-assistant-typos.png`         | assistant.js: one typo still matches                         |
| `code-09-folder-structure.png`        | The four folders and the rule between them                   |
| `code-10-npm-run-check.png`           | The full check passing                                       |

Screenshots the team still needs to take, because they need the staff PIN, a payment card,
or a GitHub login:

- Reports (Staff, PIN 1967, Reports, grouped by restaurant)
- The staff order queue and the stock screen, optional
- An AI answer from the assistant with the key saved
- The readme on GitHub
- Checkout refusing a ZIP outside the delivery area (delivery from Kirby to 77089, paid
  with the test card 4242 4242 4242 4242)

## Rules for the deck

- Do not invent features, numbers, or quotes. Use only this file and the repository.
- No more than about six short lines of text on a slide.
- Never retype code onto a slide. Use the code images as they are.
- No QR codes or links for the judges to open. The rules say judges may not click or scan
  them.
- No emoji, and no AI or tool credits on the slides.
- Leave team names, school, and chapter as visible placeholders.
- Put the speaker lines in Canva's notes, not on the slides.

## When the deck is done

- [ ] Every rubric row in the table above has its slide
- [ ] Every number on a slide appears in the facts table
- [ ] Team placeholders are filled in by the team
- [ ] The deck is downloaded as a PDF as a backup, in case the venue internet fails
- [ ] The whole talk, demo included, fits in seven minutes when rehearsed
