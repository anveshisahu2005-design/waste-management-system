// Security & Sanitization Utilities

const SecurityUtils = {
  /**
   * Escape HTML entities to prevent Cross-Site Scripting (XSS)
   */
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Sanitize URLs to prevent javascript: or data:text/html XSS in src/href
   */
  sanitizeUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    // Allow https, http, and safe data:image/
    if (/^(https?:\/\/|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(trimmed)) {
      return trimmed;
    }
    // Block dangerous protocols like javascript:, vbscript:, data:text/html
    console.warn("Blocked potentially unsafe URL protocol:", url);
    return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80';
  },

  /**
   * Sanitize CSV cells to prevent Formula Injection (DDE attacks) in Excel/Sheets
   */
  sanitizeCSV(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val).trim();
    // If the cell starts with formula trigger characters =, +, -, @, \t, \r, prepend single quote
    if (/^[=\+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return `"${str.replace(/"/g, '""')}"`;
  },

  /**
   * One-way password hash (cyrb53 + app salt). Sync so it works
   * in browser + Node without async crypto. Not bcrypt-level,
   * but prevents plaintext storage for this frontend-only demo.
   * Real backend must use bcrypt/argon2 server-side.
   */
  hashPassword(pw) {
    if (pw === null || pw === undefined) return '';
    const salted = 'ecoclean::' + String(pw);
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < salted.length; i++) {
      const ch = salted.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  },

  verifyPassword(pw, hash) {
    if (!pw || !hash) return false;
    return this.hashPassword(pw) === hash;
  },

  validatePassword(pw) {
    if (!pw || typeof pw !== 'string') return { valid: false, error: 'Password is required' };
    if (pw.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
    if (pw.length > 128) return { valid: false, error: 'Password is too long (max 128)' };
    return { valid: true };
  },

  /**
   * Validate image file upload for allowed MIME types and max size (5MB)
   */
  validateImageFile(file) {
    if (!file) return { valid: false, error: "No file selected" };
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: "Invalid file type. Only JPG, PNG, and WEBP images are allowed." 
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: "File size exceeds 5MB limit. Please upload a smaller image." 
      };
    }

    return { valid: true };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityUtils;
}
