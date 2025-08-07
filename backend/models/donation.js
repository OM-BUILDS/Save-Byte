const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  donateDateTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Donation", donationSchema);
