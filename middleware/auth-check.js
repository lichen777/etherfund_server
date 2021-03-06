const jwt = require('jsonwebtoken')
const User = require('../models').User
const config = require('../config')

/**
 *  The Auth Checker middleware function.
 */
module.exports = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({
            success: false,
            message: "Authorization Errors",
            errors: "No authorization header found."
        });
    }

    // get the last part from a authorization header string like "bearer token-value"
    const token = req.headers.authorization.split(' ')[1];

    // decode the token using a secret key-phrase
    return jwt.verify(token, config.jwtSecret, (err, decoded) => {
        // the 401 code is for unauthorized status
        if (err) { return res.status(401).json({
            success: false,
            message: "Authorization Errors",
            errors: "Request is not authorized."
            });
          }

        const userId = decoded.sub;
        const date = decoded.expiry;

        if (date !== new Date().getMonth()) {
            return res.status(401).json({
                    success: false,
                    message: "Authorization Errors",
                    errors: "Token is expired."
                })
        }

        // check if a user exists
        return User.findById(userId)
          .then(user => {
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Authorization Errors",
                    errors: "User is not found."
                })
            }
            return next();
        });
    });
};
