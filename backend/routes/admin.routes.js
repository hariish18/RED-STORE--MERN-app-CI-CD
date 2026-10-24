const express = require("express");
const {
    getStats,
    getRecentOrders,
    updateOrderStatus,
    getAdminProducts,
    updateAdminProduct,
    deleteAdminProduct,
} = require("../controller/admin.controller");
const isAuth = require("../middlewares/isAuth");
const isRole = require("../middlewares/isRole");

const router = express.Router();

// Global admin dashboard stats (orders, products, users, revenue) - admin only
router.get("/stats", isAuth, isRole("admin"), getStats);
// Last 20 orders, all customers - admin only
router.get("/orders", isAuth, isRole("admin"), getRecentOrders);
// Change processing status of an order - admin only
router.patch("/orders/:id/status", isAuth, isRole("admin"), updateOrderStatus);
// Paginated list of all products (?page=&limit=&q=) - admin only
router.get("/products", isAuth, isRole("admin"), getAdminProducts);
// Modify price / stock / sizes of a product - admin only
router.patch("/products/:id", isAuth, isRole("admin"), updateAdminProduct);
// Delete a product - admin only
router.delete("/products/:id", isAuth, isRole("admin"), deleteAdminProduct);

module.exports = router;
