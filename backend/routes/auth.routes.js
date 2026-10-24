const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    register,
    login,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    forgotPassword,
    resetPassword,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require("../controller/auth.controller");
const { registerValidation, validation, loginValidation } = require("../middlewares/validator");

const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const upload = require("../util/multer");

// 🔒 Rate limiter for login route only (protection against brute force attacks):
// must not apply to all of /api/auth, otherwise routes like /current (called on every
// app mount) exhaust quota and block register/login unrelated to brute force.
//
// `message` MUST be an object (not a string): express-rate-limit calls res.send(message),
// and Express only serializes to JSON if the body is an object. A string sends text/html,
// which frontend error handler does not parse and falls back to a generic message.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 attempts per IP per 15 minutes
    message: { message: "Too many login attempts from this IP. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// routes
router.get("/test", (req, res) => {
    res.status(200).json({ message: "Test route is working!" });
});

// Register route === signup
router.post("/register", upload.single("imageProfile"), registerValidation(), validation, register);
// Login route === signin
router.post("/login", loginLimiter, loginValidation(), validation, login);

// current == user
router.get("/current", isAuth, (req, res) => {
    // Logged-in user: response wrapped in "user" like register/login,
    // so that authReducer (which reads payload.user) works after a refresh
    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            imageProfile: req.user.imageProfile,
            role: req.user.role,
            addresses: req.user.addresses,
        },
    });
});

// Profile update (name, email, phone, password)
router.patch("/profile", isAuth, updateProfile);

// Delivery addresses saved in profile
router.post("/addresses", isAuth, addAddress);
router.patch("/addresses/:addressId", isAuth, updateAddress);
router.delete("/addresses/:addressId", isAuth, deleteAddress);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Wishlist
router.get("/wishlist", isAuth, getWishlist);
router.post("/wishlist/:productId", isAuth, addToWishlist);
router.delete("/wishlist/:productId", isAuth, removeFromWishlist);

module.exports = router;