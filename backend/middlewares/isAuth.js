const jwt = require("jsonwebtoken");
const User = require("../model/User");

const isAuth = async (req, res, next) => {
    try {
        // Retrieve token from request authorization header
        const token = req.headers["authorization"];  
        
        // Token not provided
        if (!token) {
            return res.status(403).json({ message: "No token provided" });
        }
        // Verify token
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        // User corresponding to token
        const foundUser = await User.findById(decode.id);
        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = foundUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
module.exports = isAuth;