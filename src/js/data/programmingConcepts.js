/**
 * Where each required programming concept lives in this codebase.
 *
 * The assigned topic names seven things the program should demonstrate. Modern
 * JavaScript hides several of them: map and filter do the work a for loop would do
 * in another language, so someone scanning for loops can conclude there are none.
 * This page points at the actual file and function for each, so the claim is
 * checkable rather than asserted.
 */

/** Each concept, where it is used, and what that code does. */
export const PROGRAMMING_CONCEPTS = [
  {
    concept: 'Variables',
    where: 'src/js/domain/pricing.js',
    detail:
      'calculateOrderTotals declares subtotal, discount, goods, deliveryFee, taxableBase, tax, and tip as separate named constants. Each one holds a single figure and is never reassigned, so the sequence the money moves through can be read top to bottom.',
  },
  {
    concept: 'Conditionals',
    where: 'src/js/domain/orderRules.js',
    detail:
      'isSlotUsable checks four separate things that can be wrong with a collection time, in order of how likely they are, and returns a different message for each rather than one shared failure.',
  },
  {
    concept: 'Loops',
    where: 'src/js/domain/slots.js and src/js/domain/validation.js',
    detail:
      'buildSlots walks forward in fifteen minute steps with a for loop, skipping any that fall while the restaurant is shut, with a bound on total steps so a closed restaurant cannot loop forever. passesLuhn walks a card number backwards with a for loop, doubling every second digit.',
  },
  {
    concept: 'Functions',
    where: 'every file in src/js/domain',
    detail:
      'The whole domain layer is pure functions: they take arguments, return a value, and touch nothing else. That is what lets the tests call them directly with no browser involved.',
  },
  {
    concept: 'Lists and arrays',
    where: 'src/js/data/menu.js',
    detail:
      'The catalog is an array of 426 items built from six files, flattened and indexed into a Map so looking one up does not rescan the list. Cart lines, orders, report rows, and search results are all arrays transformed with map, filter, and reduce.',
  },
  {
    concept: 'User input',
    where: 'src/js/ui/components/formField.js',
    detail:
      'Every input carries the function that checks it, so the form cannot drift out of step with its own rules. Fields check themselves when the customer leaves them, not while they are still typing.',
  },
  {
    concept: 'Program organisation',
    where: 'the src/js directory',
    detail:
      'Four layers with one rule between them: data holds the catalog, domain holds pure logic, app holds state and routing, ui holds screens. Nothing in domain may import from ui or app, which is what keeps the logic testable on its own.',
  },
];
