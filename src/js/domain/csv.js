/**
 * Turning report rows into CSV text.
 */

/**
 * Escapes one value for CSV.
 *
 * Commas, quotes, and line breaks are quoted, or every later column in the row would
 * shift.
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
 * Lines end in CRLF, which Excel on Windows expects.
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
