import rateLimit from 'express-rate-limit';

/**
 * Basic protection for the AI assistant endpoint so a single client
 * can't hammer the (potentially paid) AI provider. Tunable via env vars.
 */
export const assistantRateLimiter = rateLimit({
  windowMs: Number(process.env.ASSISTANT_RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.ASSISTANT_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many assistant requests. Please wait a moment and try again.' }
});
