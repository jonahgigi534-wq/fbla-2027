# Testing

```
npm run check       tests, then structure, documentation, spelling, and facts
npm test            just the tests
npm run coverage    the tests with a coverage report
```

None of these need anything installed. Node's own test runner does the work, so the
whole quality gate runs on a machine that has never seen `npm install`.

## Where it stands

|                                  |                          |
| -------------------------------- | ------------------------ |
| Tests                            | 275, all passing         |
| Line coverage, of what is tested | 97%                      |
| Branch coverage, of the same     | 93%                      |
| Functions documented             | 309 of 309               |
| Files over the 400 line ceiling  | none                     |
| Misspelled words on screen       | none, across 16,000 plus |

**What that coverage figure covers, and what it does not.** The tests reach
`src/js/data/`, every module in `src/js/domain/`, the router, and the AI client. Those files are what
the percentage is measured over, and they are where every decision the program makes
gets taken. The screens in `src/js/ui/` have no automated tests. They build elements
and hand the thinking to `domain/`, so testing them would mean standing up a whole
document, and most of what came back would be a test of the DOM rather than of this
program; they are checked by walking through it instead. Read the figure as 97% of the
logic, not 97% of every line in the repository.

The router is the exception, and it is worth knowing why. Its tests do fake a window,
but only just: a hash, the list of hashes visited, and one listener, in about fifty
lines at the top of `test/router.test.js`. That is the whole surface the router
touches, which is the reason it can be tested at all, and it is a long way from
pulling in a headless browser to render screens.

The AI client is tested the same way. It takes the function it sends requests with
as an argument, so the tests hand it one that answers instantly, or fails, or never
answers at all, and no request ever leaves the machine. The model's own answers are
not tested, because they come from someone else's server and differ every time. What
it is told is tested instead, in `test/aiPrompt.test.js`, because that is what decides
whether its answers are any good.

## What is tested

Every module in `src/js/domain/`, which is where the decisions live:

| Module       | What its tests protect                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| `money`      | Half up rounding, including on negatives, and parsing what a customer types      |
| `pricing`    | That discount comes off before tax, and that the delivery fee is taxed           |
| `cart`       | That nothing is edited in place, and that identical lines merge                  |
| `inventory`  | That stock is counted against the cart, not just the shelf                       |
| `budget`     | That the removal suggested is the cheapest one that closes the gap               |
| `slots`      | The midnight roll, catering lead times, and the capacity cap                     |
| `hours`      | Three different schedules, including Katy at 3am on a Saturday                   |
| `validation` | Field shape, including the Luhn checksum                                         |
| `orderRules` | Delivery areas, expired cards, unusable slots, backwards date ranges             |
| `orders`     | The window in which an order can still be changed                                |
| `reports`    | That canceled orders never count, and that periods compare like for like         |
| `insights`   | That the generated sentences match the figures under them                        |
| `assistant`  | 33 real phrasings, 8 of them misspelled, plus nonsense                           |
| `search`     | Ranking, and that word matching does not match inside words                      |
| `dietary`    | That graham cracker is not read as ham                                           |
| `csv`        | Escaping commas, quotes, and line breaks                                         |
| `carousel`   | Paging, and that the last page backfills rather than leaving a gap               |
| `aiPrompt`   | Every item at its real price, sold out marked, the gluten rule, nothing personal |

Two modules outside `domain/` are tested too. The router, because the rating sheet
asks for no navigation errors and the router is what decides them, and the AI client,
because its promise is that every failure turns into an answer from the device:

| Module         | What its tests protect                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/router`   | Route matching, a refresh landing on the same screen, an unknown address reaching Not Found, and Back closing an open dialog without moving the screen under it                    |
| `app/aiClient` | What is sent to OpenRouter, and that a rejected key, no credit, a busy service, no connection, a timeout, and an empty answer each come back as a reason the assistant can explain |

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

**The offline build had no header, footer, or buttons.** `print.css` is linked with
`media="print"` and hides all of them, which is right for a printed receipt. The
bundler concatenated every stylesheet into one unmediated `<style>` block, so those
rules applied on screen in `dist/standalone.html` alone. It survived because the route
checks drove the program with scripted clicks, and a scripted click works perfectly
well on a button with `display: none`. Found only when the tour tried to measure the
header and got back a box of zero by zero. The bundler now keeps each stylesheet under
the media it was linked with.

**Back closed a dialog and then trapped you on the screen.** Putting the address back
after closing a dialog was written with `location.replace`, which overwrites the
current history entry rather than adding one. Back had just popped an entry, so
replacing consumed it: the dialog closed correctly, and then a second Back did
nothing at all, because there was no longer anywhere to go. Navigating instead of
replacing pushes the entry back and leaves the history exactly as it was. The test
that asks for a second Back is the only reason this was found before a judge did.

**Every price in the offline build had lost its dollar sign.** The bundler put the
script into the page with a string replacement, and in a replacement string `$$` means
a single dollar sign. `formatUSD` builds every price as `` `$${dollars}` ``, so the
offline copy, the one that gets presented, showed 12.95 where the development copy
showed $12.95. Found while reading what the AI would be told, which printed prices
without the sign. The script now goes in through a function, which is inserted as it
is, and the build refuses to write a page whose script changed on the way in.

**Cleaning up the AI's answers merged its paragraphs.** Stripping a markdown bullet
used `^\s*` in multiline mode, and `\s` matches newlines too, so removing a bullet took
the blank line in front of it. The test that asks for paragraphs to survive is what
noticed.

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
4. Open the assistant and press Back. The panel should close and leave you on the same
   screen. Press Back again and you should leave it as normal.
5. Type a nonsense address and confirm the Not Found screen appears.
6. Place a full order, then cancel it and confirm the stock returns.
7. Ask the assistant eight questions including two with typos and one nonsense
   string. Confirm none returns an empty answer. Do it once with no key, and once with
   the key saved, where the subtitle should read "Built with Llama 3.3". Then turn the
   wifi off with the key still saved and ask again: the reply should say the AI could
   not be reached and answer anyway.
8. Break things on purpose: `-5` into a stock field, a report start date after its end
   date, a quantity above what is left, a collection time outside opening hours, a
   delivery ZIP outside the area, and an expired card. Every one should produce a
   message that says why.
9. `npm run build`, turn the wifi off, and open `dist/standalone.html` by double
   clicking it. Place an order, run a report, export a CSV, and open print preview.
10. Repeat step 9 in a second browser and in a guest profile, in case an extension on
    the presenting laptop interferes.
