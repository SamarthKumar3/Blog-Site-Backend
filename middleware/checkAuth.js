const jwt = require('jsonwebtoken');

const HttpError = require('./http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; 
        if (!token) {
            throw new Error('No Token present! Authentication failed!');
        }
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        req.userData = { userId: decodedToken.userId };
        next();
    }
    catch (err) {
        const error = new HttpError('Authentication failed!', 403);
        return next(error);
    }
};