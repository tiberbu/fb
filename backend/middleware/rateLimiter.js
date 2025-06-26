import rateLimit from 'express-rate-limit';

// Rate limiting middleware
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // 15 minutes default
    max, // Limit each IP to max requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limits for different endpoints
export const formSubmissionLimit = createRateLimit(15 * 60 * 1000, 50); // 50 submissions per 15 minutes
export const formConfigLimit = createRateLimit(60 * 60 * 1000, 20); // 20 form config operations per hour
export const generalLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
