# Architecture

## Four layers and one rule

```
src/js/
  data/    what the restaurant sells, where it is, and what it has already sold
  domain/  pure logic: money, pricing, cart, inventory, validation, reports
  app/     routing, state, saving
  ui/      screens and components
  main.js  wires the routes to the screens
```

Dependencies point one way only:

```
  ui  ───────►  app  ───────►  data  ───────►  domain
   │                             ▲                ▲
   └─────────────────────────────┘────────────────┘
```

**Nothing in `domain/` imports from `ui/` or `app/`.**

That single rule is what makes the rest possible. Because the logic never touches the
DOM, the state, or the clock, every function in it can be called straight from a test
with no browser and no setup. It is also the rule most easily broken by accident when
a screen needs one more helper, so `npm run check` enforces it rather than trusting
anyone to remember.

## Why the logic is pure

Every function in `domain/` takes what it needs as arguments and returns a value.
Nothing reads global state and nothing reads the clock.

That last part matters more than it sounds. "Is this card expired", "has this
collection time passed", and "is Katy open at three in the morning on a Saturday" are
all questions with a right answer that depends on when you ask. Passing the moment in
as an argument turns each of them into a test that runs in a millisecond, instead of
something that can only be confirmed by waiting until Saturday.

## How a click becomes a saved order

1. A screen in `ui/` calls a function in `app/actions.js`.
2. That function asks `domain/` whether the change is allowed. Adding to a cart goes
   through `checkAvailability`, which counts the cart as well as the shelf.
3. If allowed, it calls `update()` on `app/store.js` with a function describing the
   change.
4. The store builds a **new** state object, never editing the old one, saves it
   through `app/storage.js`, and tells every subscriber.
5. `main.js` is subscribed, so it redraws the current screen from the new state.

Placing an order does four things in that single update: records the order, takes the
stock off the shelf, empties the cart, and moves the order number on. Doing them
together means no screen can ever catch the program half way through.

## Money

Every price, subtotal, tax figure, and total is a whole number of cents. Nothing is
stored as a decimal.

An order applies a promo, then 8.25% tax, then a tip. That is three multiplications in
a row, and on floating point it reliably produces totals like `24.310000000000002`.
Working in integers means the arithmetic is exact and rounding happens once, on
purpose, in `domain/money.js`.

The order of operations is also a decision rather than an accident. The discount comes
off **before** tax is worked out, because taxing the full price and discounting
afterwards overcharges the customer. `domain/pricing.js` states the sequence at the
top of the file and the tests pin it.

## Saving

`app/storage.js` wraps every read and write in a try/catch and falls back to an
in-memory object when the browser refuses.

That is not defensive habit. The offline build is opened from a `file://` address,
where several browsers block `localStorage` outright, and a private window or a
locked down school laptop does the same. When it happens the program keeps working
and shows a banner saying the history will not survive closing the tab, which is
better than appearing to save and quietly not.

Saved data carries a schema version. Anything from a different version is discarded
rather than guessed at, so stale data from an earlier build cannot corrupt a run.

## Routing

Routes live in the URL fragment (`#/menu/burgers`) rather than the path.

A fragment works identically over `http` and from a file on a disk. A path needs a
server to answer it, and the offline build has none.

The router guarantees four things, because all four are things a judge will try: Back
and Forward move between screens rather than leaving the program, refreshing returns
to the same screen, Back closes an open dialog instead of navigating out from behind
it, and an address matching nothing lands on a real Not Found screen with a way home.

## The offline build

`npm run build` inlines the fifty-odd modules into one file, because browsers refuse
ES module imports on a `file://` page.

Each module keeps its own scope through a small registry rather than being flattened
into one. Several modules independently define helpers with the same names: two
export `normalize`, two export `describeStatus`, and several declare a local `fail`.
One shared scope would silently pick a winner.

Photographs stay as separate files beside the HTML. Images load fine from `file://`,
unlike modules, and inlining four megabytes of them as base64 would triple the size of
the document for nothing.

The build refuses to write a file containing a surviving `import`, a `fetch` call, or
any remote address. Each of those fails silently on a `file://` page, and finding out
during a presentation is not the time.
