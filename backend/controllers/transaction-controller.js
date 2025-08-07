const HttpError = require("../models/http-error");
const Food = require("../models/food");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const Donation = require("../models/donation");
const Notification = require("../models/notification");
const otpMail = require("../helpers/otp-mail");
const receiverVerifyOtpMail = require("../helpers/receiverVerifyOtp")
const donorVerifyOtpMail = require("../helpers/donorVerifyOtp")
const crypto = require("crypto");


const acceptFood = async (req, res, next) => {
  const { foodId } = req.params;
  const receiverId = req.body.receiverId;

  try {
    
    const food = await Food.findById(foodId);
    if (!food || !food.available) {
      return res
        .status(404)
        .json({    success: false, message: "Food not available or already accepted." });
    }

    
    food.available = false;
    await food.save();

  
    const donation = await Donation.findOne({ foodId: foodId }).lean();
    if (!donation) {
      return res.status(404).json({     success: false,message: "Donation record not found." });
    }

   
    const otp = crypto.randomInt(100000, 999999).toString();

  
    const transaction = new Transaction({
      donorId: donation.hostelId,
      foodId: food._id,
      receiverId: receiverId,
      status: "Started",
      otp,
      otpExpiresAt: new Date(Date.now() + 1440 * 60 * 1000), // ⏳ OTP expires in 1 day
    });

    await transaction.save();

    
    const receiver = await User.findById(receiverId).select("email");

    if (!receiver || !receiver.email) {
      return res.status(404).json({success: false, message: "Receiver email not found." });
    }

    const receiverEmail = receiver.email; 

    otpMail(receiverEmail, otp); 

    
    const notification = new Notification({
      userId: donation.hostelId, // ✅ Donor ID
      message: `Your food donation has been accepted, Transaction Id: ${transaction._id}. Please verify OTP before handing Food`,
      type: "Transaction Started",
    });

    await notification.save();

    req.io.to(donation.hostelId.toString()).emit("notification", {
      message: `Your food donation has been accepted, Transaction Id: ${transaction._id}. Please verify OTP before handing Food`,
      type: "Transaction Started",
    });

    

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (err) {
    console.error(err);
    const error = new HttpError(
      "Accepting food failed, please try again later.",
      500
    );
    return next(error);
  }
};

const rejectFood = async (req, res, next) => {
  const { foodId } = req.params;
  const userId = req.userData.userId;

  try {
   
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found." });
    }

   
    food.available = true;
    await food.save();

   
    const transaction = await Transaction.findOneAndUpdate(
      { foodId: foodId, status: "Started" },
      { status: "Failed", failedDateTime: new Date(), otp: null }, // ✅ Fixed
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction record not found." });
    }

    const donorId = transaction.donorId.toString();
    const receiverId = transaction.receiverId.toString();

    if (userId === donorId) {
      const notification = new Notification({
        userId: receiverId,
        message: `Pick-up request has been rejected by Donor!, Transaction Id: ${transaction._id}`,
        type: "Transaction Failed",
      });

     
      await notification.save();

    
      
      req.io.to(receiverId).emit("notification", {
        message: `Pick-up request has been rejected by Donor!, Transaction Id: ${transaction._id}`,
        type: "Transaction Failed",
      });

      return res.status(200).json({ success: true, transaction });

    } else if (userId === receiverId) {
      const notification = new Notification({
        userId: donorId,
        message: `Pick-up has been cancelled by Receiver!, Transaction Id: ${transaction._id}`,
        type: "Transaction Failed",
      });

    
      await notification.save();

     
      
      req.io.to(donorId).emit("notification", {
        message: `Pick-up has been cancelled by Receiver!, Transaction Id: ${transaction._id}`,
        type: "Transaction Failed",
      });

      return res.status(200).json({ success: true, transaction }); // ✅ Added Response

    } else {
      return res.status(400).json({
        success: false,
        message: "Something went wrong! Try again later.",
      });
    }

  } catch (err) {
    console.error(err);
    return next(new HttpError("Cancelling food failed, please try again later.", 500));
  }
};



const getTransactionsByNGO = async (req, res, next) => {
  const { ngoId } = req.params;

  try {
  
    const transactions = await Transaction.find({ receiverId: ngoId })
      .populate({
        path: "donorId",
        select: "organizationName latitude longitude",
      })
      .populate({
        path: "receiverId",
        select: "organizationName latitude longitude",
      })
      .populate("foodId", "foodName quantity cookedTime expiryTime");

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({success:false, message: "No transactions found for this user." });
    }

    res.status(200).json({success:true, transactions });
  } catch (err) {
    console.error(err);
    const error = new HttpError(
      "Fetching transactions failed, please try again later.",
      500
    );
    return next(error);
  }
};

const getTransactionsByHostel = async (req, res, next) => {
  const { hostelId } = req.params;

  try {
   
    const transactions = await Transaction.find({ donorId: hostelId })
      .populate({
        path: "receiverId",
        select: "organizationName phone",
      })
      .populate("foodId", "foodName quantity cookedTime expiryTime");

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({success:false, message: "No transactions found for this user." });
    }

    res.status(200).json({ success:true,transactions });
  } catch (err) {
    console.error(err);
    const error = new HttpError(
      "Fetching transactions failed, please try again later.",
      500
    );
    return next(error);
  }
};

const getTransactionsByAwc = async (req, res, next) => {
  const { awcId } = req.params;
  try {
    const transactions = await Transaction.find({ receiverId: awcId })
      .populate({
        path: "donorId",
        select: "organizationName latitude longitude",
      })
      .populate({
        path: "receiverId",
        select: "organizationName latitude longitude",
      })
      .populate("foodId", "foodName quantity cookedTime expiryTime");

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({success:false, message: "No transactions found for this user." });
    }

    res.status(200).json({success:true, transactions });
  } catch (err) {
    console.error(err);
    const error = new HttpError(
      "Fetching transactions failed, please try again later.",
      500
    );
    return next(error);
  }
};

const verifyOtp = async (req, res) => {
  const { transactionId } = req.params;
  const { otp } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found." });
    }

    if (
      !transaction.otp ||
      !transaction.otpExpiresAt ||
      new Date() > transaction.otpExpiresAt
    ) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired. Request a new one." });
    }

   
    if (transaction.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect OTP. Try again." });
    }

   
    transaction.status = "Completed";
    transaction.completedDateTime = new Date();
    transaction.otp = null; 
    transaction.otpExpiresAt = null; 

    await transaction.save();

   
    const donor = await User.findById(transaction.donorId).select("email");
    const receiver = await User.findById(transaction.receiverId).select("email");

    if (!donor || !donor.email) {
      return res
        .status(404)
        .json({ success: false, message: "Donor email not found." });
    }

    const donorEmail = donor.email;
    const receiverEmail = receiver.email;

   donorVerifyOtpMail(donorEmail);
   receiverVerifyOtpMail(receiverEmail);

  
    const notification = new Notification({
      userId: transaction.donorId,
      message: `Your food donation, Transaction Id: ${transaction._id} has been successfully completed!`,
      type: "Transaction Completed",
    });

    await notification.save();

   
  
    req.io.to(transaction.donorId.toString()).emit("notification", {
      message: `Your food donation, Transaction Id: ${transaction._id} has been successfully completed!`,
      type: "Transaction Completed",
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = {
  acceptFood,
  rejectFood,
  getTransactionsByNGO,
  getTransactionsByHostel,
  getTransactionsByAwc,
  verifyOtp,
};
