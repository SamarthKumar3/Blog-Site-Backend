const jwt = require('jsonwebtoken');

const HttpError = require('./http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; 
        if (!token) {
            throw new HttpError('Authentication failed: No token provided.', 401);
        }
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        return next(new HttpError('Authentication failed: Invalid token.', 403));
    }
};