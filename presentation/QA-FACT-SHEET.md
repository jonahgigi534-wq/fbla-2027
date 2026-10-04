# Technical fact sheet

Facts about the program, so answers in the question round are accurate. How you say
any of this is up to you.

---

## The numbers

|                                    |                                            |
| ---------------------------------- | ------------------------------------------ |
| Menu items                         | 426 across 34 categories                   |
| Restaurants                        | 6, on three different schedules            |
| Items genuinely sold out           | 11, copied from the restaurant's real menu |
| Catering items with a 48 hour rule | 71                                         |
| Generated order history            | 90 days, about 2,250 orders                |
| Tests                              | 287, 97% line coverage of the logic        |
| Functions, all documented          | 303                                        |
| JavaScript modules                 | 78                                         |
| Runtime dependencies               | none                                       |
| Outside services                   | one, optional: Llama 3.3 via OpenRouter    |
| Offline build                      | about 560 KB in one file                   |

---

## Questions with a factual answer

**Did you use any libraries?**
None at runtime. No framework, no chart library, no date library, no CSS framework.
The router, state store, chart, CSV writer, fuzzy matcher, bundler, and spell checker
were all written for this. Prettier formats the code and is optional; `npm run check`
runs without it. The one outside service is the AI behind the assistant, which is
optional and called with the browser's own fetch, not a library. Full list in
`docs/LIBRARIES.md`.

**Why no database?**
There is no server to put one on. Everything is saved in the browser's own storage,
which is the right size for the problem and the only option that survives the venue
wifi failing. A real deployment would put orders on a server, and the code is arranged
for that: the whole `domain/` layer has no idea where its data comes from.

**Are you storing credit card numbers?**
No. Card details are never sent anywhere and no card number is kept. Only the last four digits
reach the saved order, so a receipt can say which card. The card field says so. The Luhn checksum is run to catch a mistyped digit, which is the only useful
check possible without a payment processor.

**Why is the staff PIN shown under the field?**
So anyone trying the program can reach the staff side without asking. It is not
security. Real access control needs a
server to check against, which a program with no server does not have. Putting a
secret in a file that ships to the browser would be worse: it would look like security
without being any.

**How does the assistant work?**
Two ways, and it always says which one is answering.

With a key saved, each question goes to Llama 3.3 70B through OpenRouter. The model
knows nothing about House of Pies on its own, so every question is sent with the facts
it may use: all 426 items with prices, ingredients, stock, tags and allergens, the six
restaurants and whether each is open right now, the cart, the customer's recent order
numbers, and the program's own help guides. Rules go first: anything about the
restaurant comes only from those facts, never invent a price, never call anything
gluten free. The tests check exactly what it is told.

Without a key, or whenever the AI cannot answer, a built in matcher answers from the
device. It scores a question against a knowledge base of 17 intents. Keywords score,
whole phrases score more, and a word within one edit of a keyword still counts, which
is how it handles "vegitarian" and "delivary". 38 phrasings and 8 misspellings are
pinned in the tests.

**Why Llama through OpenRouter?**
OpenRouter is one address in front of many models and many hosts, and it is asked to
send each question to whichever host is fastest, usually Groq. Speed matters in a live
demonstration. And if one host is slow or down, the next takes the request, and the
model is one line in `src/js/app/aiClient.js` if it ever needs changing.

**Where is the API key? Is it exposed?**
Not in the code. Everything in the code ends up in the one file the browser opens,
where anyone can read it with View Source, and there is no server to keep a secret on.
The key is pasted into AI settings and kept in that browser only. It is a password
field, so it never shows on screen.

**What happens if someone asks it something off topic?**
Each kind of question has its own rule. A greeting gets a greeting, simple math gets
an answer and a nudge back to the menu, and politics or medical advice gets a polite
no. The menu lists no calories, so a calorie question gets told that honestly, along
with lighter dishes picked from their ingredients. It never gives a calorie number it
would have to make up.

**What is sent to the AI, and what is not?**
The question, the menu with its ingredients, stock, hours, cart, recent order numbers,
and the help guides. Never the
customer's name, phone, email, address, or card. A test fails if any of those appear.

**What if the AI says something wrong?**
It can, which is why it answers under rules and from a fixed set of facts, and why the
buttons under its answers come from the program rather than the model. It also cannot
place, change, or cancel anything. Every decision about an order is still made by the
program's own checked code.

**Why is money stored as whole cents?**
An order applies a promo, then 8.25% tax, then a tip. Three multiplications in a row on
floating point produce totals like `$24.310000000000002`. Integers make the arithmetic
exact and put the rounding in one place, on purpose.

**Why does the discount come off before tax?**
Because taxing the full price and then discounting overcharges the customer. It is a
real difference on every receipt, and it is the kind of thing nobody notices until a
receipt is compared against a till.

**How does the offline version work without a server?**
Browsers refuse ES module imports on a `file://` page, so the build inlines the modules
into one script, each keeping its own scope through a small registry. The build refuses
to write the file if a single import, fetch, or remote address survives. Photographs
stay as separate files beside it, because images load fine from `file://` and inlining
four megabytes as base64 would triple the size for nothing.

**How would this scale to fifty locations?**
The data would move to a server and `data/` would fetch instead of import. Nothing in
`domain/` would change, because none of it knows where its data comes from. The parts
that would need real work are the slot capacity, which currently assumes one kitchen
per restaurant, and stock, which would need to be authoritative on the server rather
than in the browser.

**What was the hardest bug?**
Search matched inside words, so the query "key" scored every turkey sandwich on the
menu. It was fixed once for item descriptions, and only writing the test found that
item names still had it.

**What would you do differently?**
Write the tests earlier. Three real bugs were found by writing tests after the fact,
and all three had been on screen for days.

**Is it accessible?**
Keyboard reachable throughout, with visible focus rings, a working skip link, labeled
controls, live regions so status messages are announced, and the two overlays set up
as real dialogs: they take focus when they open, keep Tab inside themselves, hand it
back when they close, and carry aria-modal so a screen reader ignores the page behind
them.

Three things were wrong and were fixed rather than glossed over. The skip link pointed
at the fragment main, which in a program routed by the fragment meant the first thing
a keyboard user did on any page was land on Not Found. The header navigation sat at
4.08:1 against the 4.5:1 small text needs, along with five other places putting white
on the brand orange at twelve pixels. And Tab walked straight out of both overlays
into the page underneath.

That is a contrast, naming and keyboard pass. It has not been through a screen reader
end to end, which is worth saying plainly rather than claiming more than was done.

---

## Held back on purpose

Worth keeping for the question round rather than spending presentation time on:

- `npm run check` runs the whole suite and four custom checks in about a second, with
  nothing installed
- The structure check enforces that `domain/` never imports from `ui/` or `app/`
- The spell check found the whole interface had been written in British English
- Order history is generated from a fixed seed, so the figures are identical on any
  machine
- Canceling an order returns its stock to the shelf
- Collection slots are capped at four per fifteen minutes so the counter does not
  back up
- Sold out items suggest substitutes from the same category at a similar price
