/**
 * Turning report rows into CSV text.
 *
 * A manager who wants to do something the reports screen does not do needs the
 * numbers out, and CSV is what a spreadsheet opens.
 *
 * Pure string building, so test/csv.test.js can check the escaping without a browser.
 * Downloading it is the screen's job, because that part needs the DOM.
 */

/**
 * Escapes one value for CSV.
 *
 * A field containing a comma, a quote, or a newline has to be wrapped in quotes with
 * its own quotes doubled. Menu items like "Kids Mac 'N Cheese & Fruit Cup" and any
 * special instruction a customer typed will hit this, and getting it wrong shifts
 * every later column in the row.
 *
 * @param {*} value Anything to put in a cell.
 * @returns {string} The value, quoted and escaped if it needs to be.
 */
export function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Builds a CSV document from headers and rows.
 *
 * Lines end with a carriage return and newline, which is what the CSV convention
 * asks for and what keeps Excel on Windows happy.
 *
 * @param {string[]} headers Column headings.
 * @param {Array<Array>} rows Row values, in the same order as the headings.
 * @returns {string} The CSV text.
 */
export function toCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','));
  }
  return lines.join('\r\n');
}
