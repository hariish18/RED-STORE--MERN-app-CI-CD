const User = require("../model/User");
const Product = require("../model/Product");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const cloudinary = require("../util/cloudinary");

// Common format returned to frontend for a user (never the password)
const sanitizeUser = (user) => ({
    name: user.name,
    email: user.email,
    phone: user.phone,
    imageProfile: user.imageProfile,
    cloudinary_id: user.cloudinary_id,
    role: user.role,
    addresses: user.addresses,
});

// register = signup
exports.register = async (req, res) => {
    try {
        // Receives request from frontend == signup form submit
        const { name, email, password } = req.body;
        // Search user by email
        const foundUser = await User.findOne({ email: email });
        // If user already exists
        if (foundUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        let imageProfile = "";
        let cloudinary_id = "";
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageProfile = result.secure_url;
            cloudinary_id = result.public_id;
        }
        // Create user document according to model
        // Password hashing is handled automatically by the pre('save') hook on User model
        const newUser = new User({ name, email, password, imageProfile, cloudinary_id });
        // Save to database
        await newUser.save();
        // Token = JWT
        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { expiresIn: '2h' });
        // Response
        res.status(201).json({ message: "User registered successfully",  user: { name, email, imageProfile, cloudinary_id, role: newUser.role }, token });
    } catch (error) {
        // Full details logged on server only: client gets generic message to prevent leaking internal details
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// login = signin
exports.login = async (req, res) => {
    try {
        // Request from frontend == login form submit
        const { email, password } = req.body;
        // Search by email
        const foundUser = await User.findOne({ email: email });
        // User not found
        if (!foundUser) {
            return res.status(400).json({ message: "Invalid email or password " });
        }

        // Compare password against hashed password
        const checkPassword = await bcrypt.compare(password, foundUser.password);
        // If password is incorrect
        if (!checkPassword) return res.status(401).json({ message: "Invalid email or password " });

        // JWT token
        const token = jwt.sign({ id: foundUser._id }, process.env.SECRET_KEY, { expiresIn: '2h' });
        // Response
        res.status(200).json({ message: "Login successful", user: { name: foundUser.name, email: foundUser.email, imageProfile: foundUser.imageProfile, cloudinary_id: foundUser.cloudinary_id, role: foundUser.role }, token });
    } catch (error) {
        // Full details logged on server only: client gets generic message to prevent leaking internal details
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update profile information (name, email, phone, optional password)
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (existing) return res.status(400).json({ message: "Email already in use" });
        }

        if (name) req.user.name = name;
        if (email) req.user.email = email;
        if (phone !== undefined) req.user.phone = phone;
        if (password) {
            if (password.length < 6 || password.length > 32) {
                return res.status(400).json({ message: "Password must be between 6 and 32 characters" });
            }
            req.user.password = password; // Automatically hashed by the pre('save') hook of the model
        }

        await req.user.save();
        res.status(200).json({ message: "Profile updated successfully", user: sanitizeUser(req.user) });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Adds a new delivery address to the profile
exports.addAddress = async (req, res) => {
    try {
        const { label, fullName, address, city, postalCode, phone, isDefault } = req.body;
        if (!fullName || !address || !city || !postalCode || !phone) {
            return res.status(400).json({ message: "All address fields are required" });
        }
        if (isDefault) req.user.addresses.forEach((a) => { a.isDefault = false; });
        req.user.addresses.push({ label, fullName, address, city, postalCode, phone, isDefault: !!isDefault });
        await req.user.save();
        res.status(201).json({ message: "Address added successfully", user: sanitizeUser(req.user) });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Updates an existing address
exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const addressDoc = req.user.addresses.id(addressId);
        if (!addressDoc) return res.status(404).json({ message: "Address not found" });

        const { label, fullName, address, city, postalCode, phone, isDefault } = req.body;
        if (label !== undefined) addressDoc.label = label;
        if (fullName !== undefined) addressDoc.fullName = fullName;
        if (address !== undefined) addressDoc.address = address;
        if (city !== undefined) addressDoc.city = city;
        if (postalCode !== undefined) addressDoc.postalCode = postalCode;
        if (phone !== undefined) addressDoc.phone = phone;
        if (isDefault) {
            req.user.addresses.forEach((a) => { a.isDefault = false; });
            addressDoc.isDefault = true;
        }

        await req.user.save();
        res.status(200).json({ message: "Address updated successfully", user: sanitizeUser(req.user) });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Deletes an address from the profile
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const addressDoc = req.user.addresses.id(addressId);
        if (!addressDoc) return res.status(404).json({ message: "Address not found" });

        addressDoc.deleteOne();
        await req.user.save();
        res.status(200).json({ message: "Address deleted successfully", user: sanitizeUser(req.user) });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Password reset request: generates temporary token (1h), sends an email if a
// mail service is configured (none currently configured, see CLAUDE.md), otherwise logs the link
// in console for dev flow. Always returns the same message whether email exists or not,
// to prevent attackers from enumerating registered emails
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const genericMsg = { message: "If this email is registered, a reset link has been sent." };
        if (!email) return res.status(400).json({ message: "Email is required" });

        const foundUser = await User.findOne({ email });
        if (!foundUser) return res.status(200).json(genericMsg);

        const rawToken = crypto.randomBytes(32).toString("hex");
        foundUser.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        foundUser.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
        await foundUser.save();

        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

        if (process.env.SMTP_HOST) {
            // No mail service configured in this project (see CLAUDE.md, backend/.env):
            // block left in place to connect real email delivery later without touching the rest of the flow.
        } else {
            console.log(`[dev] Password reset link for ${email}: ${resetLink}`);
        }

        res.status(200).json(genericMsg);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Applies new password if token (received via link) is valid and non-expired
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password || password.length < 6 || password.length > 32) {
            return res.status(400).json({ message: "Password must be between 6 and 32 characters" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const foundUser = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!foundUser) return res.status(400).json({ message: "Invalid or expired reset link" });

        foundUser.password = password; // Automatically hashed by the pre('save') hook of the model
        foundUser.resetPasswordToken = undefined;
        foundUser.resetPasswordExpires = undefined;
        await foundUser.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// List wishlist products for logged-in user
exports.getWishlist = async (req, res) => {
    try {
        const populated = await req.user.populate("wishlist");
        res.status(200).json({ message: "Wishlist:", wishlist: populated.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Adds product to wishlist (idempotent)
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (!req.user.wishlist.some((id) => id.toString() === productId)) {
            req.user.wishlist.push(productId);
            await req.user.save();
        }
        res.status(200).json({ message: "Added to wishlist", wishlist: req.user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Removes product from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        req.user.wishlist = req.user.wishlist.filter((id) => id.toString() !== productId);
        await req.user.save();
        res.status(200).json({ message: "Removed from wishlist", wishlist: req.user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};