
const User = require("../models/User");
const Store = require("../models/Store");
const Rating = require("../models/Rating");

exports.getOwnerDashboard = async (req, res) => {
  try {
    const owner = await User.findById(req.user.id);

    if (!owner || owner.role !== "owner" || !owner.storeId) {
      return res.status(403).json({
        message: "Owner account or linked store not found"
      });
    }

    const store = await Store.findOne({
      _id: owner.storeId,
      ownerId: owner._id
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found"
      });
    }

    const summary = await Rating.aggregate([
      { $match: { storeId: store._id } },
      {
        $group: {
          _id: "$storeId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const ratings = await Rating.find({ storeId: store._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const stats = summary[0] || {
      averageRating: null,
      totalRatings: 0
    };

    res.json({
      store: {
        id: store._id,
        name: store.name,
        address: store.address
      },
      averageRating: stats.averageRating === null
        ? null
        : Number(stats.averageRating.toFixed(1)),
      totalRatings: stats.totalRatings,
      ratings: ratings.map(item => ({
        user: item.userId
          ? {
              name: item.userId.name,
              email: item.userId.email
            }
          : null,
        rating: item.rating,
        submittedAt: item.createdAt
      }))
    });
  } catch (error) {
    console.error("Owner dashboard error:", error.message);

    res.status(500).json({
      message: "Failed to load owner dashboard"
    });
  }
};
