const express = require("express");
const { getHealth } = require("../controller/health.controller");

const router = express.Router();

// Public, without authentication or rate-limit
router.get("/", getHealth);

module.exports = router;
