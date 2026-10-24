// Utility script: changes a user's role via email. Required
// for testing admin dashboard (no UI allows self-promotion,
// and no account has "admin" role by default).
//
// Usage: node scripts/setUserRole.js you@example.com admin

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const User = require("../model/User");

const [, , email, role = "admin"] = process.argv;

const setRole = async () => {
    if (!email) {
        console.error("Usage: node scripts/setUserRole.js you@example.com [role]");
        process.exit(1);
    }
    if (!["client", "admin"].includes(role)) {
        console.error(`Invalid role: "${role}" (expected "client" or "admin")`);
        process.exit(1);
    }

    await connectDB();

    const user = await User.findOneAndUpdate({ email }, { $set: { role } }, { returnDocument: "after" });

    if (!user) {
        console.log(`Not found: ${email}`);
    } else {
        console.log(`${user.email} -> role: ${user.role}`);
    }

    await mongoose.disconnect();
    process.exit(user ? 0 : 1);
};

setRole().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
