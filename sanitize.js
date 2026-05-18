// sanitize.js — Input sanitization for Moncatu forms

var MoncatuSanitize = (function() {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  function stripTags(str) {
    if (!str) return '';
    return String(str).replace(/<[^>]*>/g, '');
  }

  function sanitizeText(input) {
    return escapeHtml(stripTags(String(input || '').trim()));
  }

  function sanitizeEmail(input) {
    var email = String(input || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '';
    return escapeHtml(email);
  }

  function sanitizePhone(input) {
    var phone = String(input || '').trim();
    if (!/^\+?[\d\s\-()]+$/.test(phone) || phone.replace(/\D/g, '').length < 10) return '';
    return escapeHtml(phone);
  }

  function sanitizeZip(input) {
    var zip = String(input || '').trim();
    if (!/^\d{5}$/.test(zip)) return '';
    return zip;
  }

  function applyToForm(formElement) {
    if (!formElement) return;
    var inputs = formElement.querySelectorAll('input, textarea');
    inputs.forEach(function(input) {
      input.addEventListener('input', function() {
        var val = input.value;
        if (/<script|javascript:|on\w+\s*=/i.test(val)) {
          input.value = stripTags(val);
        }
      });
    });
  }

  return {
    escapeHtml: escapeHtml,
    stripTags: stripTags,
    sanitizeText: sanitizeText,
    sanitizeEmail: sanitizeEmail,
    sanitizePhone: sanitizePhone,
    sanitizeZip: sanitizeZip,
    applyToForm: applyToForm
  };
})();
