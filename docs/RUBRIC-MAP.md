# Rating sheet map

Where to look for each scored item. The presentation rows are not listed, since those
are earned in the room rather than in the code.

## Code Quality, 20 points

**Comments, naming, and formatting**

- Every function has a documentation block, private helpers included. 234 of 234,
  checked by
  `npm run check`, not by inspection.
- Every file opens with a block saying what it is for and who calls it.
- Inline comments explain why rather than what. The standard, and the reasoning
  behind it, is in [STYLE.md](STYLE.md).
- If you read one file, read `src/js/domain/pricing.js`. It is short, it is the part
  most likely to be got wrong, and its comments explain a decision that changes the
  total on every receipt.

**Modular structure**

- Four layers with an enforced rule between them:
  nothing in `domain/` may import from `ui/` or `app/`. Checked by
  `scripts/check-structure.mjs`.
- That rule is why 237 tests can run with no browser.
- No file over 400 lines and no function over its ceiling, also checked. A function
  in domain or app may run to 80 lines, one in ui to 130, because a view builder is a
  declarative tree rather than branching logic. The reports screen reached 496 during
  development and was split into `reports.js`, `reportControls.js`, `reportTable.js`,
  and `reportView.js`.

## User Experience, 25 points

**Intuitive interface and clear instructions**

- Instructions are inside the program, under **Help**, not only in this repository.
- Every list has an instructional empty state that names the situation and offers one
  button that fixes it: empty cart, no orders, no search results, an empty report
  range, a filtered stock list with nothing in it.
- The staff PIN is printed on the screen that asks for it, so nobody exploring the
  program hits a wall.

**Navigation, help menu, and an intelligent feature**

- **No spelling errors:** every on-screen string is checked against a committed word
  list by `scripts/spellcheck.mjs`. That check found the interface had been written in
  British English and fixed 50 instances.
- **Interactive help menu:** Help → Guides, searchable across titles, bodies, and
  keywords.
- **No navigation errors:** hash routing, so Back and Forward work, refresh returns to
  the same screen, Back closes a dialog rather than leaving, and an unknown address
  lands on a real Not Found screen.
- **An intelligent feature:** the **Pie Assistant**, an offline question and answer
  system. It scores keyword matches against a knowledge base, tolerates typos through
  bounded edit distance, reads live menu, stock, cart, and order state to build its
  answers, and always offers somewhere to go next. 40 phrasings and 8 misspellings are
  pinned in `test/assistant.test.js`.

**Input validation on both syntactical and semantic levels**

- The split is the design, not a claim: `domain/validation.js` asks whether a value is
  well formed, `domain/orderRules.js` asks whether it suits this order.
- All 15 inputs, with both checks side by side, are listed in the program under
  **Help → Validation rules**.
- The clearest example: a ZIP code can be five real digits and still not be one this
  restaurant delivers to. Each gets a different message.

## Functionality, 25 points

**Addresses all parts of the prompt, correlation explained in the instructions**

- The full clause by clause mapping is **in the program**, under
  **Help → How this meets the topic**, quoting each clause of the assigned topic and
  linking to the feature that answers it.
- Also summarized in the [README](../README.md).

**A presentable report the user can customize and analyze**

- Staff → Reports. Customizing is a date range with presets, filters for restaurant
  and order type, seven groupings, four measures, and sortable columns.
- Analyzing is the preceding period of equal length shown beside every figure, a
  percentage change on every row, and generated sentences naming what moved.
- Exports to CSV, with an on-screen fallback when a browser blocks the download.
  Prints through a stylesheet that strips the navigation.
- The customer has a report of their own under **Your spending**.

**Data storage**

- 90 days of orders across six restaurants, generated from a fixed seed so the same
  history appears on any machine.
- Arrays and Maps throughout: the catalog is an array of 426 items indexed by id,
  carts and orders are arrays, reports group with a Map.
- Money is integer cents everywhere. Saved state carries a schema version and falls
  back to memory when a browser refuses to store anything.

## Documentation, 20 points

- Eight documents, indexed in [INDEX.md](INDEX.md), each with one job.
- A readme explaining how to run the program three ways.
- The source, organized in four layers.
- A list of templates and libraries: [LIBRARIES.md](LIBRARIES.md). At runtime there
  are none.
- Attribution for everything borrowed: [CREDITS.md](CREDITS.md), including the House
  of Pies name, logo, photographs, and menu, with an unaffiliated project disclaimer.
- The guides are readable inside the program under **Help**, so they are available
  during the presentation without opening a file.
