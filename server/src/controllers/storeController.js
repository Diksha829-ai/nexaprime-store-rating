
const Store = require("../models/Store");
const Rating = require("../models/Rating");

// Escape regex characters so searches are treated as plain text.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.getStores = async (req, res) => {
  try {
    const rawSearch = req.query.search;

    if (
      rawSearch !== undefined &&
      typeof rawSearch !== "string"
    ) {
      return res.status(400).json({
        message: "Search must be a single text value",
      });
    }

    const search = (rawSearch || "").trim();

    if (search.length > 100) {
      return res.status(400).json({
        message: "Search cannot exceed 100 characters",
      });
    }

const filter = search
  ? {
      $or: [
        {
          name: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
        {
          address: {
            $regex: escapeRegex(search),
            $options: "i",
          },
        },
      ],
    }
  : {};

    const stores = await Store.find(filter)
      .select("name address")
      .lean();

    const storeIds = stores.map((store) => store._id);

    const summaries = storeIds.length
      ? await Rating.aggregate([
          { $match: { storeId: { $in: storeIds } } },
          {
            $group: {
              _id: "$storeId",
              averageRating: { $avg: "$rating" },
              totalRatings: { $sum: 1 },
            },
          },
        ])
      : [];

    const summaryMap = new Map(
      summaries.map((item) => [
        String(item._id),
        item,
      ])
    );

    const myRatings = storeIds.length
      ? await Rating.find({
          userId: req.user.id,
          storeId: { $in: storeIds },
        }).lean()
      : [];

    const myRatingMap = new Map(
      myRatings.map((item) => [
        String(item.storeId),
        item.rating,
      ])
    );

    const result = stores.map((store) => {
      const summary = summaryMap.get(String(store._id));

      return {
        id: store._id,
        name: store.name,
        address: store.address,
        averageRating: summary
          ? Number(summary.averageRating.toFixed(1))
          : null,
        totalRatings: summary?.totalRatings || 0,
        myRating:
          myRatingMap.get(String(store._id)) ?? null,
      };
    });

    return res.json({ stores: result });
  } catch (error) {
    console.error("Get stores error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch stores",
    });
  }
};
