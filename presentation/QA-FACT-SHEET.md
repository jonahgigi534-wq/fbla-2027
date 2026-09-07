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
| Generated order history            | 90 days, about 2,300 orders                |
| Tests                              | 225, 97% line coverage                     |
| Exported functions, all documented | 157                                        |
| JavaScript modules                 | 64                                         |
| Runtime dependencies               | none                                       |
| Offline build                      | one file, 446 KB                           |

---

## Questions with a factual answer

**Did you use any libraries?**
None at runtime. No framework, no chart library, no date library, no CSS framework.
The router, state store, chart, CSV writer, fuzzy matcher, bundler, and spell checker
were all written for this. Prettier formats the code and is optional; `npm run check`
runs without it. Full list in `docs/LIBRARIES.md`.

**Why no database?**
There is no server to put one on. Everything is saved in the browser's own storage,
which is the right size for the problem and the only option that survives the venue
wifi failing. A real deployment would put orders on a server, and the code is arranged
for that: the whole `domain/` layer has no idea where its data comes from.

**Are you storing credit card numbers?**
No. Nothing is sent anywhere and no card number is kept. Only the last four digits
reach the saved order, so a receipt can say which card. The payment step says so on
screen. The Luhn checksum is run to catch a mistyped digit, which is the only useful
check possible without a payment processor.

**Why is the staff PIN printed on the screen?**
Because this is a demonstration, and a hidden PIN would lock the audience out of half
the program. It is not security and the screen says so. Real access control needs a
server to check against, which a program with no server does not have. Putting a
secret in a file that ships to the browser would be worse: it would look like security
without being any.

**How does the assistant work?**
It scores a question against a knowledge base of 14 intents. Keywords score, whole
phrases score more, and a word within one edit of a keyword still counts, which is how
it handles "vegitarian" and "delivary". The winning intent then builds its answer from
the live menu, stock, cart, and orders, so it cannot contradict the screens. If nothing
scores confidently it offers the closest topics instead of giving up. No model, no
network. 40 phrasings and 8 misspellings are pinned in the tests.

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
Keyboard reachable throughout, with visible focus rings, a skip link, labeled
controls, and live regions so status messages are announced. It has not been through a
formal audit, which is worth saying plainly rather than claiming more than was done.

---

## Held back on purpose

Worth keeping for the question round rather than spending presentation time on:

- `npm run check` runs 237 tests and three custom checks in half a second, with
  nothing installed
- The structure check enforces that `domain/` never imports from `ui/` or `app/`
- The spell check found the whole interface had been written in British English
- Order history is generated from a fixed seed, so the figures are identical on any
  machine
- Canceling an order returns its stock to the shelf
- Collection slots are capped at four per fifteen minutes so the counter does not
  back up
- Sold out items suggest substitutes from the same category at a similar price
