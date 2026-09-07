# House of Pies Ordering System

A digital ordering system for [House of Pies](https://houseofpies.com/), a family
owned restaurant and bakery that has been serving Houston since 1967 and now runs six
locations across Houston, The Woodlands, Cypress, and Katy.

Built for the FBLA 2026-2027 **Introduction to Programming** event, whose topic is
_Local Business Digital Ordering System_.

It runs in a browser with **no libraries, no build step required, no server, and no
internet connection**.

---

## Running it

You need [Node.js](https://nodejs.org) 20 or newer. Nothing else, and nothing to
install: the program has no runtime dependencies.

### The normal way

```
npm start
```

Then open <http://localhost:4173>.

### Offline, from a single file

```
npm run build
```

That writes `dist/standalone.html`. Double click it. No server, no network, no
terminal. This is the copy used for the presentation, because the competition
provides no electricity and warns that venue wifi may not work.

Keep the `dist` folder together: the photographs sit next to the HTML file.

### Checking it

```
npm run check
```

Runs 237 tests, then three checks of its own: that the layers have not been crossed,
that every function is documented, and that nothing on screen is misspelled.
Like everything else here, it needs nothing installed.

---

## What it does

**For customers**

- Browse or search **426 real menu items** across 34 categories, with the
  restaurant's own descriptions and prices
- Filter by section, category, or dietary need, and sort four ways
- Pick from **six restaurants**, each with its own hours and delivery area
- Set a **spending limit** that warns you as you approach it and blocks checkout if
  you pass it, naming the cheapest item to remove
- Order for pickup, delivery, or dine in, with promo codes and a full tax breakdown
- Change or cancel an order until the kitchen starts cooking, then track it through
  four stages and print an itemized receipt
- Ask the **Pie Assistant** a question in plain English, entirely offline
- See what you have spent over 30, 90, or 365 days and what you order most

**For staff**

- A live order queue with one button to move a ticket to its next stage
- Stock levels that feed straight through to the customer side, so setting something
  to zero marks it sold out everywhere
- **Sales reports** over 90 days of history: filter by date, restaurant, and order
  type, group seven ways, measure four ways, sort any column, and read every figure
  against the same length period before it

---

## How it answers the topic

The assigned topic asks for a system that lets customers browse products or services,
place and manage orders, calculate totals, and review order information, while
handling unavailable items, inventory limits, invalid entries, and customer budget
constraints.

The full clause by clause mapping is **inside the program**, under
Help → How this meets the topic, with a link from each clause to the feature that
answers it. A short version:

| The topic asks for          | Where it is                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| Products **or services**    | 355 menu products, plus 71 catering items and custom cakes carrying the restaurant's real 48 hour notice |
| Place and **manage** orders | Track, edit item by item, cancel, reorder, print                                                         |
| Calculate purchase totals   | Whole cent arithmetic, discount applied before tax                                                       |
| Review order information    | Printable receipts, plus a spending summary                                                              |
| Unavailable items           | 11 items are genuinely sold out, and each offers substitutes                                             |
| Inventory limits            | Stock counted against the cart, not just the shelf                                                       |
| Invalid entries             | Every input checked for shape, then for whether it suits the order                                       |
| Customer budget constraints | A spending limit that warns, blocks, and suggests                                                        |
| Efficiency for the business | Collection slots capped so the counter does not back up                                                  |

---

## How the code is organized

Four layers, and one rule between them.

```
src/js/
  data/     the menu, locations, promos, help content, generated order history
  domain/   pure logic: money, pricing, cart, inventory, validation, reports
  app/      routing, state, saving
  ui/       screens and components
```

**Nothing in `domain/` may import from `ui/` or `app/`.** That is what keeps the
business logic callable from a test with no browser involved, and it is checked
mechanically by `npm run check` rather than left to memory.

Money is a whole number of cents everywhere. Applying a promo, then 8.25% tax, then a
tip on floating point produces totals like `24.310000000000002`, which is not a number
to put in front of a customer.

More detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Documentation

Everything is in [docs/INDEX.md](docs/INDEX.md), and the guides are also readable
inside the program under Help.

- [User guide](docs/USER-GUIDE.md) for both the customer and staff sides
- [Architecture](docs/ARCHITECTURE.md) for how the pieces fit
- [Libraries](docs/LIBRARIES.md) for what was used, which at runtime is nothing
- [Credits](docs/CREDITS.md) for where the menu, photographs, and name came from
- [Testing](docs/TESTING.md) for what is covered and how to run it
- [Style](docs/STYLE.md) for the comment and naming standard
- [Rubric map](docs/RUBRIC-MAP.md) for where to look for each scored item

---

## A note on the House of Pies name

This is an independent student project. It is **not affiliated with, endorsed by, or
connected to House of Pies**. Their name, logo, and photographs remain their property
and are used here to build a realistic project about a real local business. Menu
items and prices were taken from their public ordering page and are representative
rather than a live price list. See [docs/CREDITS.md](docs/CREDITS.md).
