const client = require("prom-client");
client.collectDefaultMetrics({ 
    register: client.register, 
    prefix: "redstore_" 
});

const express = require("express");
const cors = require("cors");

const app = express();
app.disable("x-powered-by");

app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));

const corsOptions = {
    origin: [
        "http://localhost:5173",
        process.env.CLIENT_URL || "https://YOUR_FRONTEND_URL.netlify.app",
    ],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ---- Prometheus metrics ----
const httpRequestCounter = new client.Counter({
    name: "redstore_http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status"],
});

app.use((req, res, next) => {
    res.on("finish", () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
        });
    });
    next();
});

// Endpoint /metrics (protected by METRICS_TOKEN)
app.get("/metrics", async (req, res) => {
     const token = req.headers.authorization?.replace("Bearer ", "");
    if (token !== process.env.METRICS_TOKEN) {
        return res.status(401).json({ msg: "Unauthorized" });
    }
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

// ---- NoSQL Injection protection (Express 5 compatible) ----
const sanitizeObject = (obj) => {
    if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj)) {
            if (key.startsWith("$") || key.includes(".")) {
                delete obj[key];
            } else {
                sanitizeObject(obj[key]);
            }
        }
    }
};

app.use((req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.params) sanitizeObject(req.params);
    next();
});

// ---- Import and register routes ----
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/prod.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const cartRoutes = require("./routes/cart.routes");
const adminRoutes = require("./routes/admin.routes");

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;