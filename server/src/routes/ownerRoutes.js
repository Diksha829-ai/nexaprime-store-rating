
const express = require("express");
const router = express.Router();

const { getOwnerDashboard } = require("../controllers/ownerController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

// Only store owners can access their dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize("owner"),
  getOwnerDashboard
);

module.exports = router;
