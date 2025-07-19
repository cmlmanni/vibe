/* filepath: /js/modules/ai/utils/formatters.js */
export function formatMessageContent(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-700 px-1 rounded text-xs font-mono">$1</code>'
    )
    .replace(/\n/g, "<br>");
}

export function truncateText(text, maxLength = 50) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export function sanitizeText(text) {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}