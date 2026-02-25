/**
 * Extracts title, body, and combined text from the current Piazza post.
 * Selectors based on Piazza's DOM: h2#postViewSummaryId and div[data-id="renderHtmlId"].
 *
 * @returns {{ title: string, body: string, combinedText: string } | null}
 */
export function extractPiazzaPost() {
  const titleEl = document.getElementById('postViewSummaryId');
  const bodyEl = document.querySelector('[data-id="renderHtmlId"]');

  if (!titleEl || !bodyEl) {
    return null;
  }

  const title = (titleEl.textContent || '').trim();
  const body = (bodyEl.textContent || '').trim();
  const combinedText = title ? `${title}\n\n${body}` : body;

  if (!combinedText) {
    return null;
  }

  return { title, body, combinedText };
}
