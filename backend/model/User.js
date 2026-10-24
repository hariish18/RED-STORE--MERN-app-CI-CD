const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Delivery address stored in user profile
const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        default: "Home",
        trim: true,
    },
    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        default: "",
        trim: true,
    },
    imageProfile: {
        type: String,
        default: "../images/image.jpg",
    },
    cloudinary_id: String,
    // User role: "client" by default, "admin" to access dashboard
    // (replaces legacy isAdmin field, which was never used for real access control)
    role: {
        type: String,
        enum: ["client", "admin"],
        default: "client",
    },
    addresses: [addressSchema],
    // User favorite products (wishlist)
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    // Password reset: only hashed token is stored, never plain token
    // (sent/logged once only, see auth.controller.js#forgotPassword)
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
}, { timestamps: true });

// Automatic password hashing before save, only if modified
// (prevents re-hashing an existing hash on every save())
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema);
module.exports = User;