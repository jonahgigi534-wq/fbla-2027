# Testing

```
npm run check       tests, then structure, documentation, and spelling
npm test            just the tests
npm run coverage    the tests with a coverage report
```

None of these need anything installed. Node's own test runner does the work, so the
whole quality gate runs on a machine that has never seen `npm install`.

## Where it stands

| | |
| --- | --- |
| Tests | 225, all passing |
| Line coverage | 97% |
| Branch coverage | 93% |
| Exported functions documented | 157 of 157 |
| Files over the 400 line ceiling | none |
| Misspelled words on screen | none, across 2,226 checked |

## What is tested

Every module in `src/js/domain/`, which is where the decisions live:

| Module | What its tests protect |
| --- | --- |
| `money` | Half up rounding, including on negatives, and parsing what a customer types |
| `pricing` | That discount comes off before tax, and that the delivery fee is taxed |
| `cart` | That nothing is edited in place, and that identical lines merge |
| `inventory` | That stock is counted against the cart, not just the shelf |
| `budget` | That the removal suggested is the cheapest one that closes the gap |
| `slots` | The midnight roll, catering lead times, and the capacity cap |
| `hours` | Three different schedules, including Katy at 3am on a Saturday |
| `validation` | Field shape, including the Luhn checksum |
| `orderRules` | Delivery areas, expired cards, unusable slots, backwards date ranges |
| `orders` | The window in which an order can still be changed |
| `reports` | That cancelled orders never count, and that periods compare like for like |
| `insights` | That the generated sentences match the figures under them |
| `assistant` | 40 real phrasings, 8 of them misspelled, plus nonsense |
| `search` | Ranking, and that word matching does not match inside words |
| `dietary` | That graham cracker is not read as ham |
| `csv` | Escaping commas, quotes, and line breaks |

## What is not tested, and why

**Screen rendering.** No test opens a browser. The screens are thin: they read state
and call domain functions, and both of those are tested directly. Testing that a
button renders would mostly test the DOM library rather than this program.

The screens are instead exercised by hand against a checklist before each release:
every route, Back, Forward, refresh, a garbage address, a full order end to end, and
the deliberate breakages listed below.

**The generated history.** `seedOrders.js` is checked by using it: the reports tests
run against generated orders, so a change that broke the generator would fail there.

## Bugs the tests caught

Worth recording, because they are the argument for having written them.

**Search matched inside words.** The query `key` scored every turkey sandwich on the
menu. An earlier fix had covered item descriptions but not item names, and only
writing the test found the half that was left.

**A tie in the reports was not a tie by accident.** A test assumed two rows would
differ; they came out exactly equal. The assumption was wrong rather than the code,
and the tie break is now pinned as deliberate behavior.

**One exported function had no `@returns`.** Found by the documentation check, not by
reading.

**The whole interface was in British English.** Found by the spell check. A Houston
diner had a "Help centre" and a list of "favourites". Fifty replacements across
twenty-seven files.

## Testing it by hand

The checklist run before the offline build is considered ready:

1. `npm run check` passes.
2. `npm start`, then visit every screen. Press Back, Forward, and F5 on each.
3. Open an item, press Back, and confirm the menu returns rather than the program
   exiting.
4. Type a nonsense address and confirm the Not Found screen appears.
5. Place a full order, then cancel it and confirm the stock returns.
6. Ask the assistant eight questions including two with typos and one nonsense
   string. Confirm none returns an empty answer.
7. Break things on purpose: `-5` into a stock field, a report start date after its end
   date, a quantity above what is left, a collection time outside opening hours, a
   delivery ZIP outside the area, and an expired card. Every one should produce a
   message that says why.
8. `npm run build`, turn the wifi off, and open `dist/standalone.html` by double
   clicking it. Place an order, run a report, export a CSV, and open print preview.
9. Repeat step 8 in a second browser and in a guest profile, in case an extension on
   the presenting laptop interferes.
