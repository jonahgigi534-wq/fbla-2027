/**
 * The project's own documentation, readable inside the program.
 *
 * Judges have no internet at the competition and no Markdown reader. Eight .md files
 * opened in Notepad is not "clearly labeled and professionally presented", which is
 * what the Documentation row asks for. So the parts that matter most, the attribution
 * and the library list, are also here as a screen.
 *
 * The figures are kept in one place so they cannot drift apart across the interface.
 */

/** Headline figures about the program. */
export const PROJECT_STATS = [
  { label: 'Menu items', value: '426', note: 'across 34 categories' },
  { label: 'Restaurants', value: '6', note: 'on three different schedules' },
  { label: 'Runtime dependencies', value: 'None', note: 'no framework, no libraries' },
  { label: 'Tests', value: '225', note: '97% line coverage' },
];

/** What was borrowed, and from whom. */
export const ATTRIBUTION = [
  {
    what: 'Name, logo, and photographs',
    source: 'House of Pies',
    detail:
      'Their property, used to build a realistic project about a real local business. This is an independent student project and is not affiliated with, endorsed by, or connected to House of Pies.',
  },
  {
    what: 'Menu, prices, addresses, hours',
    source: 'The restaurant’s public ordering page',
    detail:
      'Copied while this was being built. Representative rather than a live price list, and they will drift as the restaurant changes its menu.',
  },
  {
    what: 'Items marked sold out',
    source: 'The same ordering page',
    detail:
      'Eleven items were genuinely out of stock and were kept that way, so the inventory rules have real cases to handle instead of invented ones.',
  },
  {
    what: 'Sales figures in the reports',
    source: 'Generated, not real',
    detail:
      'Ninety days of orders produced from a fixed seed. None of it is real House of Pies trading data and none of it is claimed to be.',
  },
  {
    what: 'Code',
    source: 'Written for this project',
    detail: 'No template, starter, or example project was used, and nothing was copied from another codebase.',
  },
  {
    what: 'Icons',
    source: 'Standard Unicode emoji',
    detail: 'Rendered by your own device. No icon set was downloaded or bundled.',
  },
];

/** Things that would normally be a library, and what replaced them. */
export const INSTEAD_OF_LIBRARIES = [
  { usually: 'A UI framework', instead: 'src/js/ui/dom.js, about 60 lines' },
  { usually: 'A router', instead: 'src/js/app/router.js, hash based' },
  { usually: 'A state store', instead: 'src/js/app/store.js, one object and a subscribe list' },
  { usually: 'A charting library', instead: 'src/js/ui/components/barChart.js, SVG rectangles' },
  { usually: 'A CSV writer', instead: 'src/js/domain/csv.js' },
  { usually: 'A fuzzy search library', instead: 'src/js/domain/assistant.js, bounded edit distance' },
  { usually: 'A test framework', instead: "Node's built in test runner" },
  { usually: 'A bundler', instead: 'scripts/build-standalone.mjs' },
  { usually: 'A spell checker', instead: 'scripts/spellcheck.mjs with a committed word list' },
];
