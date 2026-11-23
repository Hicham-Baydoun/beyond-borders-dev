// Turns an API error into form errors (KAN-83). Kept free of React so it can be tested with node:test.
//
// The server answers validation failures with 400 { error, details: { field: [messages] } }.
// Field messages go under their field; everything else becomes one message for the whole form.

/**
 * @param {{ status?: number, message?: string, details?: Record<string, string[] | string> }} err
 * @param {string[]} knownFields names of the fields on this form
 * @returns {{ fields: Record<string, string>, form: string | null, retry: boolean }}
 */
export function mapServerErrors(err, knownFields = []) {
  const fields = {};
  const leftovers = [];
  if (err?.status === 400 && err.details && typeof err.details === 'object') {
    for (const [name, messages] of Object.entries(err.details)) {
      const first = Array.isArray(messages) ? messages[0] : messages;
      if (typeof first !== 'string') continue;
      if (knownFields.includes(name)) fields[name] = first;
      else leftovers.push(first);
    }
  }
  const hasFieldErrors = Object.keys(fields).length > 0;
  let form = null;
  if (leftovers.length) form = leftovers.join(' ');
  else if (!hasFieldErrors) form = err?.message || 'Something went wrong. Please try again.';
  // 409: the data changed under us (for example, places no longer available). Offer to try again.
  return { fields, form, retry: err?.status === 409 };
}
