/**
 * Detecta la franquicia de la tarjeta basándose en el número.
 * @param {string} numero - El número de tarjeta completo
 * @returns {string} - Nombre de la franquicia (Visa, MasterCard, Amex, Discover, Diners Club) o 'Desconocida'
 */
exports.detectFranchise = (numero) => {
  const cleanNumber = numero.replace(/\D/g, ''); // Quita espacios o guiones

  // Patrones regulares para las principales franquicias (IIN/BIN)
  const patterns = {
    Visa: /^4/,
    MasterCard: /^(5[1-5]|2[2-7])/,
    Amex: /^3[47]/,
    Discover: /^6(?:011|5)/,
    'Diners Club': /^3(?:0[0-5]|[68])/
  };

  for (const [franchise, regex] of Object.entries(patterns)) {
    if (regex.test(cleanNumber)) {
      return franchise;
    }
  }

  return 'Desconocida';
};
