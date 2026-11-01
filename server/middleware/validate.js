/**
 * Lightweight, dependency-free input validation. Kept intentionally
 * simple - swap for zod/joi later if the schema grows.
 */
export function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const value = req.body?.[f];
      return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
    }
    next();
  };
}
