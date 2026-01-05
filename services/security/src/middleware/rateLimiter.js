import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window (increased for testing)
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
