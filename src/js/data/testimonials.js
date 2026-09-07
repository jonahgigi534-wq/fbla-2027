/**
 * Guest reviews shown in the carousel at the bottom of the home screen.
 *
 * These are real reviews House of Pies publishes on its own site. Each entry is a
 * short pull quote rather than the whole review, kept word for word and credited to
 * the name the restaurant displays it under. The screen says where they came from,
 * and docs/CREDITS.md records it again alongside the photographs.
 *
 * The one edit made to any of them is punctuation: the original of Taman's review
 * separates the clauses with a dash, which is written as a comma here to match the
 * rest of the interface.
 *
 * Read by ui/components/testimonials.js. Nothing else should reach into this list.
 */

/** Every review is a five star review on the restaurant's site, which is what it shows. */
const FIVE_STARS = 5;

/**
 * The reviews, in the order the restaurant lists them.
 *
 * @type {Array<{id: string, name: string, rating: number, quote: string}>}
 */
export const TESTIMONIALS = [
  {
    id: 'james-nunez',
    name: 'James Nunez',
    rating: FIVE_STARS,
    quote: 'Had the BEST breakfast here! Awesome selection of traditional diner favorites.',
  },
  {
    id: 'taman',
    name: 'Taman',
    rating: FIVE_STARS,
    quote: 'The selection of pies and freshness will not disappoint, hence the name.',
  },
  {
    id: 'holly',
    name: 'Holly',
    rating: FIVE_STARS,
    quote: "My go to is the chocolate cheesecake. It is a chocolate lover's dream.",
  },
  {
    id: 'ymelis',
    name: 'Ymelis',
    rating: FIVE_STARS,
    quote: 'I love my egg white hangover omelet.',
  },
  {
    id: 'nida',
    name: 'Nida',
    rating: FIVE_STARS,
    quote: 'Great diner for post-date dessert. Pie always slaps.',
  },
];

/** Said under the carousel so nobody mistakes these for reviews of this program. */
export const TESTIMONIAL_SOURCE = 'Guest reviews published by House of Pies at houseofpies.com.';
