const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["HOSTEL", "NGO", "AWC"],
    required: true,
  },

  organizationName: {
    type: String,
    required: [true, "Organization Name is required"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password should have at least 6 characters"],
  },

  phone: {
    type: String,
    required: [true, "Mobile number is required"],
  },

  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },

  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetToken: {
    type: String,
    default: null,
  },
  expireToken: {
    type: Date,
    default: null,
  },
});

userSchema.plugin(uniqueValidator, {
  message: "{PATH} must be unique",
});

module.exports = mongoose.model("User", userSchema);
