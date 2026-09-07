# Code style

The rating sheet scores comments that are "logical, useful, and complete". Complete is
the only one of those three a script can measure, so this document says what the other
two mean here, and `npm run check` enforces what it can.

## Comments

**Every exported function carries a documentation block** with `@param` for each
argument and `@returns`. Checked by `scripts/check-jsdoc.mjs`, which fails the build
if one is missing. 157 of 157 currently pass.

**Every file opens with a block saying what it is for and who calls it.** A reader
landing in the middle of the project should learn where they are without opening
three other files.

**Inline comments say why, not what.** The code already says what it does.

```js
// Wrong. The line below says this.
// Loop through the items and add up the prices
for (const line of lines) { ... }

// Right. This is the part the code cannot say.
// Whole words only. A substring test would let the query "key" score every item
// whose description happens to mention turkey.
```

That rule has a scoring reason as well as a readability one. The rating sheet's
1-6 band is "comments provided but are not logical", and narrating the obvious is
exactly how a file lands there. A comment that restates the next line is worse than
no comment, because it adds length without adding information.

**Comments explain decisions.** Most of the ones in this project answer "why is it
this way and not the obvious way": why money is in cents, why the discount comes off
before tax, why the staff PIN is printed on screen, why photographs are not inlined
into the offline build. Those are the questions a reader actually has.

## Naming

| Kind | Convention | Example |
| --- | --- | --- |
| Functions and variables | `camelCase` | `calculateOrderTotals` |
| Booleans | a question | `isOpenAt`, `canCancel`, `hasSeenWelcome` |
| Constants | `UPPER_SNAKE_CASE` | `SALES_TAX_BASIS_POINTS` |
| Files | `camelCase.js` | `orderRules.js` |
| CSS classes | block, element, modifier | `.item-card__name`, `.chip--active` |

Numbers get names. `825` in the middle of a calculation means nothing;
`SALES_TAX_BASIS_POINTS` means something, and it can be found.

Functions do one thing and are named after it. If a name needs "and" in it, the
function needed splitting.

## Structure

**Four layers, one rule: nothing in `domain/` may import from `ui/` or `app/`.**
Checked by `scripts/check-structure.mjs`. That is what keeps the logic testable
without a browser.

**No source file over 400 lines.** Also checked. Data files are exempt, because a
catalog of 426 menu items is long for a reason that splitting will not fix. The
reports screen hit 496 lines during development and was split into four.

**No mutation.** Functions return new objects and arrays rather than editing what they
were given. The store replaces state wholesale, so a function that edited in place
would change what another screen is still holding and produce a bug a long way from
its cause.

## Formatting

Prettier, at 100 columns, single quotes, trailing commas. It is the only development
dependency and it is optional: `npm run check` deliberately runs without it, so the
quality gate works on a machine that has never run `npm install`.

## Spelling

Every string the program can put on screen is checked against a committed word list,
including the ones nobody looks at: `aria-label`s, `alt` text, placeholders, and
validation messages that only appear when something goes wrong.
