const jwt = require("jsonwebtoken");
const User = require("../model/User");

// Identifies user if a valid token is provided, without blocking request otherwise (allows guest checkout)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers["authorization"];
        if (!token) return next();
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        const foundUser = await User.findById(decode.id);
        if (foundUser) req.user = foundUser;
    } catch (error) {
        // Invalid or expired token -> proceed as guest
    }
    next();
};

module.exports = optionalAuth;
