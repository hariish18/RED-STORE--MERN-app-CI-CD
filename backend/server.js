// Entry point: environment variables, MongoDB connection, then listen on port.
// dotenv must be loaded BEFORE app.js (util/cloudinary.js reads config on import).
require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

// Database connection
const connectDB = require("./config/connectDB");
connectDB();

// --- Anti cold-start middleware -----------------------------------------
// On Render free plan, the instance sleeps after ~15 min of inactivity.
// If the frontend sends multiple parallel requests on wake up, the first
// triggers the Mongo connection while subsequent ones arrive before it is
// ready -> cascading 500 errors. This middleware returns a clean 503 as long
// as Mongo is not connected, allowing the frontend to retry.
app.use((req, res, next) => {
    // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            msg: "Backend warming up, please retry in a few seconds",
            dbState: mongoose.connection.readyState,
        });
    }
    next();
});

// --- Port listening ------------------------------------------------------
// Fallback to 10000 (Render default port) if PORT is not defined locally
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, (err) => {
    err
        ? console.error("❌ Startup error:", err)
        : console.log(`✅ The server is running on http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
    console.log("⚠️ SIGTERM received, shutting down server...");
    server.close(async () => {
        try {
            await mongoose.connection.close();   // ✅ Modern Mongoose 7+ API
            console.log("✅ Server and Mongo connection closed cleanly");
            process.exit(0);
        } catch (error) {
            console.error("❌ Error during shutdown:", error.message);
            process.exit(1);
        }
    });
});

// --- Unhandled error capture (prevents silent crashes) -------------------
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error.message, error.stack);
    // Do not exit: Render would restart the instance and lose context
});