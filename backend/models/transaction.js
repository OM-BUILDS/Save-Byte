const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  status: {
    type: String,
    enum: ["Started", "Failed", "Completed"],
    default: "Started",
  },
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null }, 
  startDateTime: { type: Date, default: Date.now },
  failedDateTime: { type: Date, default: null },
  completedDateTime: { type: Date, default: null },
});

module.exports = mongoose.model("Transaction", transactionSchema);
