const attempts = new Map();

const getClientIp = (req) => String(req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();

const normalizeIdentity = (req) => String(
    req.body?.email
    || req.body?.telephone
    || req.body?.username
    || ''
).trim().toLowerCase();

export const createRateLimiter = ({
    windowMs = 15 * 60 * 1000,
    max = 5,
    keyPrefix = 'default'
} = {}) => (req, res, next) => {
    const now = Date.now();
    const identity = normalizeIdentity(req);
    const key = `${keyPrefix}:${getClientIp(req)}:${identity || 'anonymous'}`;
    const current = attempts.get(key);

    if (!current || current.expiresAt <= now) {
        attempts.set(key, { count: 1, expiresAt: now + windowMs });
        return next();
    }

    current.count += 1;
    attempts.set(key, current);

    if (current.count > max) {
        const retryAfterSeconds = Math.ceil((current.expiresAt - now) / 1000);
        res.set('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({
            success: false,
            message: 'Trop de tentatives. Reessayez apres 15 minutes.'
        });
    }

    return next();
};

export const loginRateLimiter = createRateLimiter({
    keyPrefix: 'login',
    max: 5
});

export const codeRateLimiter = createRateLimiter({
    keyPrefix: 'code',
    max: 3
});
