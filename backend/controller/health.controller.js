const mongoose = require("mongoose");

// API health status, used by Docker HEALTHCHECK and CI/CD smoke test.
// Returns non-sensitive information only: no host, URI, or env var other than version.
exports.getHealth = (req, res) => {
    const dbUp = mongoose.connection.readyState === 1;

    // Never cached: each call must reflect real state
    res.set("Cache-Control", "no-store");
    res.status(dbUp ? 200 : 503).json({
        status: dbUp ? "ok" : "error",
        db: dbUp ? "up" : "down",
        version: process.env.APP_VERSION || "dev",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
};
