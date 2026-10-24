// backend/config/connectDB.js
const dns = require("dns");
const mongoose = require("mongoose");

// On some Windows machines, "Internet Connection Sharing" (ICS)
// installs a local DNS proxy on 127.0.0.1 that Node uses by default, but which
// does not properly resolve SRV records (required for mongodb+srv://).
// We force reliable public resolvers to bypass this broken proxy.
if (dns.getServers().every((server) => server === "127.0.0.1" || server === "::1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const RETRY_DELAYS_MS = [5000, 10000, 20000];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Distinguish DNS/network errors from auth errors to facilitate diagnosis
const describeError = (error) => {
    const dnsErrorCodes = ["ENOTFOUND", "ECONNREFUSED", "EAI_AGAIN"];
    const isDnsError =
        dnsErrorCodes.includes(error.code) ||
        /querySrv|ENOTFOUND|ECONNREFUSED|EAI_AGAIN/i.test(error.message);
    const isAuthError =
        error.name === "MongoServerError" &&
        (error.code === 18 || /auth|authentication|bad auth/i.test(error.message));

    if (isDnsError) {
        return "DNS/network error: unable to resolve or reach MongoDB Atlas cluster (check network/DNS connection, or consider mongodb:// format without SRV, see backend/.env.example)";
    }
    if (isAuthError) {
        return "Authentication error: invalid MongoDB credentials (check username/password in MONGODB_URI)";
    }
    return "Uncategorized MongoDB connection error";
};

const connectDB = async () => {
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {});
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`❌ MongoDB Connection Error: ${error.message}`);
            console.error(`   → ${describeError(error)}`);

            const isLastAttempt = attempt === RETRY_DELAYS_MS.length;
            if (isLastAttempt) {
                console.error(
                    `❌ Failed to connect to MongoDB after ${RETRY_DELAYS_MS.length + 1} attempts. Giving up.`
                );
                process.exit(1);
            }

            const delay = RETRY_DELAYS_MS[attempt];
            console.warn(`⏳ Retrying in ${delay / 1000}s...`);
            await wait(delay);
        }
    }
};

module.exports = connectDB;