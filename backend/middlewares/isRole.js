// To be used after isAuth (which attaches req.user): 403 if role of
// authenticated user is not in allowed roles
const isRole = (...allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
};

module.exports = isRole;
