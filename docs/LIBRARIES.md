# Libraries and tools

The event guidelines ask for a list of any templates or libraries used. This is it.

## At runtime: none

The program uses no frameworks, no libraries, and no packages. Not React, not jQuery,
not a chart library, not a date library, not a CSS framework. Every line that runs in
the browser was written for this project or is a standard browser feature.

That is a deliberate choice rather than a boast. The competition provides no
electricity and warns that venue wifi may be unreliable, so anything fetched from a
content delivery network is a risk with no upside. Hand writing a bar chart as SVG
took an afternoon; a chart library that fails to load takes the whole demonstration.

Things that would normally be a dependency, and what replaced them:

| Usually a library | What this uses instead |
| --- | --- |
| A UI framework | `src/js/ui/dom.js`, about 60 lines |
| A router | `src/js/app/router.js`, hash based |
| A state store | `src/js/app/store.js`, one object and a subscribe list |
| A charting library | `src/js/ui/components/barChart.js`, SVG rectangles |
| A CSV writer | `src/js/domain/csv.js` |
| A fuzzy search library | `src/js/domain/assistant.js`, bounded edit distance |
| A test framework | Node's built in `node --test` |
| A bundler | `scripts/build-standalone.mjs` |
| A spell checker | `scripts/spellcheck.mjs` with a committed word list |

## At development time: one, and it is optional

**Prettier** formats the source consistently. It is the only entry in
`devDependencies` and it is not required to run, build, test, or check the program.
`npm run check` deliberately needs nothing installed, so the quality gate works on a
machine that has never run `npm install`.

Install it only if you intend to edit the code:

```
npm install
npm run format
```

## Fonts and images

No web fonts. The interface uses the system font stack, which loads instantly and
cannot fail to arrive.

Photographs are local files in `assets/img`. Nothing is loaded from a remote host, and
`npm run build` refuses to write the offline file if any `http` or `https` address
survives into it.

## Standard browser features used

`localStorage` for saving, wrapped in a fallback for browsers that block it on a
`file://` page. `Intl`-backed number formatting through `toLocaleString`. `SVG` for
the chart. Nothing here needs a polyfill for any browser released in the last decade.
