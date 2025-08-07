const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  vegType: { type: String, required: true },
  available: { type: Boolean, default:true},
  quantity: { type: Number, required: true },
  cookedTime: { type: Date, required: true },
  expiryTime: { type: Date, required: true },
  wastageReason: {
    type: String,
    enum: ["Special Event", "Semester Examination", "Over Cooking", "Others"],
    required: true,
  },
  wasteFoodType: {
    type: String,
    enum: ["Fresh Food", "Plate Waste"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model("Food", foodSchema);
