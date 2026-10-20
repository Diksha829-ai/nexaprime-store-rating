
const Rating = require("../models/Rating");
const Store = require("../models/Store");

exports.upsertRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5",
      });
    }

    const storeExists = await Store.exists({ _id: storeId });

    if (!storeExists) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    const savedRating = await Rating.findOneAndUpdate(
      {
        userId: req.user.id,
        storeId,
      },
     {
  $set: { rating },
},
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: "Rating submitted successfully",
      rating: savedRating.rating,
      storeId: savedRating.storeId,
      updatedAt: savedRating.updatedAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Rating conflict. Please retry.",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid store ID",
      });
    }

    console.error("Rating error:", error.message);
    res.status(500).json({ message: "Failed to save rating" });
  }
};
