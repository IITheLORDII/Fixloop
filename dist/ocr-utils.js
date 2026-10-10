(function exposeOcrUtilities(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FixLoopOCR = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
  const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);

  function validateImageFile(file) {
    if (!file) return { valid: false, error: 'Bir PNG veya JPG dosyası seçin.' };
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) return { valid: false, error: 'Yalnızca PNG ve JPG desteklenir.' };
    if (!Number.isFinite(file.size) || file.size <= 0) return { valid: false, error: 'Görsel dosyası boş.' };
    if (file.size > MAX_IMAGE_BYTES) return { valid: false, error: 'Görsel en fazla 12 MB olabilir.' };
    return { valid: true, error: '' };
  }

  function redactSensitiveText(value) {
    return String(value || '')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[e-posta gizlendi]')
      .replace(/\bTR\d{2}(?:\s?\d{4}){5}\s?\d{2}\b/gi, '[IBAN gizlendi]')
      .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[kart numarası gizlendi]')
      .replace(/\b(?:\+?90|0)?\s*\(?5\d{2}\)?(?:[\s.-]*\d{3})(?:[\s.-]*\d{2}){2}\b/g, '[telefon gizlendi]')
      .replace(/\b(password|passwd|parola|şifre|sifre|api[ _-]?key|access[ _-]?key|secret|token)\s*[:=]\s*\S+/gi, '$1: [gizlendi]');
  }

  function cleanOcrText(value, maxLength = 900) {
    return redactSensitiveText(value)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  function mergeProblemText(problem, ocrText, maxLength = 1000) {
    const typed = String(problem || '').trim();
    const scanned = cleanOcrText(ocrText);
    if (!scanned) return typed.slice(0, maxLength);
    if (!typed) return scanned.slice(0, maxLength);
    if (typed.toLocaleLowerCase('tr').includes(scanned.toLocaleLowerCase('tr'))) return typed.slice(0, maxLength);
    return `${typed}\nEkran metni: ${scanned}`.slice(0, maxLength);
  }

  return { MAX_IMAGE_BYTES, validateImageFile, redactSensitiveText, cleanOcrText, mergeProblemText };
}));
