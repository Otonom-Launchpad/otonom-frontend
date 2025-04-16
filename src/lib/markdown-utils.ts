/**
 * Utility function to convert markdown-like text to properly formatted HTML
 * This handles basic markdown syntax like **bold**, *italic* and # headers
 */
export function parseMarkdown(text: string): string {
  if (!text) return '';
  
  // Replace headers (# Header) with proper HTML
  let parsedText = text.replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // Replace bold (**text**) with <strong>
  parsedText = parsedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic (*text*) with <em>
  parsedText = parsedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace line breaks with <br />
  parsedText = parsedText.replace(/\n/g, '<br />');
  
  return parsedText;
}
