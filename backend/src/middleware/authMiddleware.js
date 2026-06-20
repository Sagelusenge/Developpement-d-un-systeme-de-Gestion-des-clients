import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Acces refuse. Token manquant.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expire.'
        });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acces interdit. Votre role (${req.user.role}) ne permet pas cette action.`,
                rolesAutorises: roles
            });
        }
        next();
    };
};

export const protectClient = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Acces client refuse. Token manquant.' });
    }
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.type !== 'client') {
            return res.status(403).json({ success: false, message: 'Cet espace est reserve aux clients.' });
        }
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token client invalide ou expire.' });
    }
};
