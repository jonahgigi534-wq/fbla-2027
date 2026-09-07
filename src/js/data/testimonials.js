/**
 * Guest reviews shown in the carousel at the bottom of the home screen.
 *
 * These are real reviews House of Pies publishes on its own home page, each one
 * complete rather than trimmed, word for word, and credited to the name the
 * restaurant displays it under. The screen says where they came from, and
 * docs/CREDITS.md records it again alongside the photographs.
 *
 * Two changes, both punctuation and both noted in CREDITS: Taman's review separates
 * two clauses with a hanging dash and Ymelis's with three hyphens, and each is
 * written as a comma here so it does not read as a rendering fault. The wording is
 * otherwise untouched, including where a guest's own spelling differs from the menu.
 * "calm chowder" and "Bayoo goo" are theirs, not typing errors in this catalog.
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
    quote:
      'Had the BEST breakfast here! Awesome selection of traditional diner favorites. The pancakes with mixed berries, bananas, and pecan whipped butter were delicious. The pancakes were perfect. Had a side of crispy bacon which was good. I sampled the cinnamon roll and the calm chowder.',
  },
  {
    id: 'taman',
    name: 'Taman',
    rating: FIVE_STARS,
    quote:
      'The selection of pies and freshness will not disappoint, hence the name. Great breakfast stop as well. Huge selection and perfect execution. Nice bacon crisp but not overdone. Everything is homemade from scratch. Great coffee. Lovely flavor. Five star service and good prices.',
  },
  {
    id: 'holly',
    name: 'Holly',
    rating: FIVE_STARS,
    quote:
      "Super cute and cozy restaurant. Although I've never dined in at this location: I've been here several times to pick up a slice of pie. Everyone is always warm and welcoming when you walk in. My go to is the chocolate cheesecake. It is a chocolate lover's dream. So rich and so chocolatey.",
  },
  {
    id: 'ymelis',
    name: 'Ymelis',
    rating: FIVE_STARS,
    quote:
      'I love the vibe! House of Pies ("Guys"), they have Great Omelets, and Sides. BLT is great, according to my friend. I love my egg white hangover omelet. I love the shrimp and vegetables folded inside. Side salad is decent. Who can\'t resist the Cheesecake? I love the Chocolate one.',
  },
  {
    id: 'nida',
    name: 'Nida',
    rating: FIVE_STARS,
    quote:
      'Great diner for post-date dessert. Pie always slaps. Bayoo goo is always delicious. Sugar free cherry pie was pretty good too. Glad this place is around!',
  },
];

/** Said under the carousel so nobody mistakes these for reviews of this program. */
export const TESTIMONIAL_SOURCE = 'Guest reviews published by House of Pies at houseofpies.com.';
