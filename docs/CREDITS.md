# Credits and attribution

The event guidelines require that any use of copyrighted material, images, logos, or
trademarks is properly documented. This is that documentation.

## House of Pies

**House of Pies Restaurant & Bakery** is a real, family owned business that has been
trading in Houston, Texas since 1967. Everything below belongs to them.

> This is an independent student project built for an FBLA Introduction to
> Programming event. It is **not affiliated with, endorsed by, sponsored by, or
> connected to House of Pies** in any way. No part of it is a real ordering system,
> no order placed in it reaches the restaurant, and no payment is ever processed.

### What was used, and where it came from

| Material                                    | Source                     | How it is used                                                                |
| ------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| The name "House of Pies"                    | The business               | Used nominatively, to identify the real restaurant this project is about      |
| Logo                                        | <https://houseofpies.com>  | Shown in the page header and as the browser tab icon                          |
| Six storefront photographs                  | Their location pages       | One per restaurant on the home screen                                         |
| Six dish photographs                        | Their home page            | The featured items                                                            |
| Bakery, cake, and mini pie photographs      | Their bakery page          | Category images                                                               |
| Twenty category photographs                 | Their online ordering menu | Shown for items that have no photograph of their own                          |
| Menu item names, descriptions, and prices   | Their online ordering menu | The catalog in `src/js/data/`                                                 |
| Addresses, phone numbers, and opening hours | Their location pages       | `src/js/data/locations.js`                                                    |
| Items marked out of stock                   | Their online ordering menu | Kept as the sold out items, so the inventory rules have real cases            |
| Bakery doodle background pattern            | Their home page            | Behind the guest reviews on the home screen                                   |
| Five guest reviews                          | Their home page            | Quoted in the review carousel, credited to the names they are published under |

All image files are in `assets/img`. Copyright in every photograph and in the logo
remains with House of Pies.

### On the prices and the menu

Menu items and prices were copied from the restaurant's public ordering page while
this project was being built. They are **representative, not a live price list**, and
they will drift as the restaurant changes its menu. Nothing here should be used to
work out what a meal actually costs.

### Why a real business rather than a made up one

The assigned topic asks for a digital ordering system for a local business. Inventing
a restaurant would have made every hard part easy: no awkward hours to model, no
catering menu with a 48 hour rule, no items that are genuinely out of stock, and no
six locations on three different schedules. Using a real one is the difference
between the program handling real situations and only appearing to.

## Everything else

**Code.** Every line was written for this project. No template, starter, boilerplate,
or example project was used, and nothing was copied from another codebase.

**Libraries.** None at runtime. See [LIBRARIES.md](LIBRARIES.md) for the full list and
for the one optional development tool.

**Fonts.** Two, both the ones House of Pies uses on its own site, and both under the
SIL Open Font License 1.1, which permits redistribution:

| Face       | Designer                       | Source       |
| ---------- | ------------------------------ | ------------ |
| Bebas Neue | Ryoichi Tsunekawa, Dharma Type | Google Fonts |
| Parkinsans | Commissioned by Parkinson's UK | Google Fonts |

The two Latin subsets ship in `assets/fonts` and total 42 KB. They are served from
there rather than from Google because the program has to work with no internet, and a
webfont that fails to arrive would drop the whole interface back to a system sans. A
copy of each license belongs beside the files if this is ever distributed further.

**Guest reviews.** The five reviews in the carousel are real reviews House of Pies
publishes on its own home page. Each is a short pull quote rather than the whole
review, kept word for word, and credited to the name the restaurant displays it under.
The only change is to Taman's, where a dash between two clauses is written as a comma.
Copyright in the words remains with the people who wrote them. The screen says
underneath where they came from, so nobody reads them as reviews of this program.

**Icons.** The small pictures on tiles with no photograph are standard Unicode emoji,
rendered by the reader's own device. No icon set was downloaded or bundled.

**Colors.** Taken by eye from the restaurant's own signage and menu boards, and
defined in `src/css/tokens.css`.

**Sales figures.** Every number in the reports is generated by
`src/js/data/seedOrders.js` from a fixed seed. None of it is real House of Pies
trading data, and none of it is claimed to be.
