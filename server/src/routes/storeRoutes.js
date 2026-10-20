
const express = require("express");
const router = express.Router();

const { getStores } = require("../controllers/storeController");
const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

router.get("/", authenticate, authorize("user"), getStores);

module.exports = router;
