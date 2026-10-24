const jwt = require("jsonwebtoken");
const User = require("../model/User");

// Creates a user directly in the database (password hashed by pre('save') hook)
const createUser = async (overrides = {}) => {
    const user = new User({
        name: "Test User",
        email: `user-${Date.now()}-${Math.random().toString(16).slice(2)}@test.local`,
        password: "secret123",
        ...overrides,
    });
    await user.save();
    return user;
};

// Same token format as auth.controller (payload { id }, signed with SECRET_KEY)
const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "2h" });

module.exports = { createUser, tokenFor };
