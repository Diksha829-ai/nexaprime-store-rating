
const express = require("express");
const router = express.Router();

const {
  upsertRating,
} = require("../controllers/ratingController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

router.put(
  "/:storeId",
  authenticate,
  authorize("user"),
  upsertRating
);

module.exports = router;
