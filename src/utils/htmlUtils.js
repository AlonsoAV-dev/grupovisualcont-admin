/**
 * Decodifica entidades HTML a sus caracteres correspondientes
 * @param {string} text - Texto con entidades HTML
 * @returns {string} - Texto decodificado
 */
export function decodeHTMLEntities(text) {
  if (!text) return text;
  
  const entidades = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    // Vocales acentuadas
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    // Eñe
    '&ntilde;': 'ñ',
    '&Ntilde;': 'Ñ',
    // Diéresis
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    // Signos de puntuación español
    '&iexcl;': '¡',
    '&iquest;': '¿',
    // Símbolos especiales
    '&deg;': '°',
    '&ordm;': 'º',
    '&ordf;': 'ª',
    '&copy;': '©',
    '&reg;': '®',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&sect;': '§',
    '&para;': '¶',
    '&middot;': '·',
    '&laquo;': '«',
    '&raquo;': '»',
    '&hellip;': '…',
    '&ndash;': '–',
    '&mdash;': '—',
    '&bull;': '•',
  };
  
  let decoded = text;
  
  // Reemplazar entidades nombradas
  decoded = decoded.replace(/&[a-zA-Z]+;/g, (match) => entidades[match] || match);
  
  // Reemplazar entidades numéricas decimales (&#123;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  
  // Reemplazar entidades numéricas hexadecimales (&#xAB;)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return decoded;
}
