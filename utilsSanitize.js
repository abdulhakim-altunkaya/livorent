// middleware/sanitizeInputs.js

const escapeHtml = (str) => {
  return str
    .trim()
    .replace(/&/g, '&amp;')      // Must go first!
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const sanitizeObject = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = escapeHtml(obj[key]);
    }
  }
};

function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
}

module.exports = sanitizeInputs; // 👈 Exporting the middleware directly
