/**
 * Small helpers for building DOM nodes.
 *
 * Screens build their markup by calling el() rather than assigning innerHTML with a
 * template string. The difference matters: text passed here becomes a text node, so
 * a menu item named with an ampersand, or anything a customer types into a special
 * instructions box, is displayed as written and can never be parsed as markup.
 *
 * Used by every screen and component.
 */

/**
 * Builds an element.
 *
 * Attribute names are passed through as written, so 'aria-label' and 'data-id' work
 * without special handling. A 'class' entry sets className, and an 'onClick' style
 * key attaches a listener.
 *
 * @param {string} tag Tag name, such as 'div' or 'button'.
 * @param {object} [attributes] Attributes, listeners, and class.
 * @param {Array<Node|string>|Node|string} [children] Child nodes or text.
 * @returns {HTMLElement} The finished element.
 */
export function el(tag, attributes = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      node.className = value;
    } else if (key === 'text') {
      node.textContent = value;
    } else {
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) {
      continue;
    }
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/**
 * Replaces everything inside a container with new content.
 *
 * Null and undefined children are dropped rather than rendered, so a screen can
 * write a conditional child inline without guarding every one of them.
 *
 * @param {HTMLElement} container The element to empty.
 * @param {Array<Node>|Node} content What to put in it.
 * @returns {HTMLElement} The container.
 */
export function render(container, content) {
  const list = Array.isArray(content) ? content : [content];
  const nodes = list.filter((child) => child !== null && child !== undefined && child !== false);
  container.replaceChildren(...nodes);
  return container;
}

/**
 * Builds the empty state shown when a list has nothing in it.
 *
 * Every list screen uses this, so a customer who filters everything away always gets
 * the same shape of answer: what happened, and one button that fixes it.
 *
 * @param {object} options Content for the empty state.
 * @param {string} options.icon A single emoji shown above the title.
 * @param {string} options.title What the situation is, in a few words.
 * @param {string} options.body One sentence on what to do about it.
 * @param {{label: string, onClick: Function}} [options.action] Optional way out.
 * @returns {HTMLElement} The empty state element.
 */
export function emptyState({ icon, title, body, action }) {
  return el('div', { class: 'empty-state' }, [
    el('div', { class: 'empty-state__icon', 'aria-hidden': 'true', text: icon }),
    el('p', { class: 'empty-state__title', text: title }),
    el('p', { class: 'empty-state__body', text: body }),
    action
      ? el('button', { class: 'button', type: 'button', onClick: action.onClick }, action.label)
      : null,
  ]);
}

/**
 * Builds a coloured message banner.
 *
 * @param {string} tone One of 'info', 'warning', 'danger', or 'success'.
 * @param {string} title Bold first line.
 * @param {string} body The rest of the message.
 * @returns {HTMLElement} The banner element.
 */
export function banner(tone, title, body) {
  return el(
    'div',
    { class: `banner banner--${tone}`, role: tone === 'danger' ? 'alert' : 'status' },
    [el('div', {}, [el('div', { class: 'banner__title', text: title }), el('div', { text: body })])]
  );
}
