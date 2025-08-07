const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Food = require("../models/food");
const Donation = require("../models/donation");
const Notification = require("../models/notification");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const foodNotifyMail = require("../helpers/notification-mail");

const addFood = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { vegType, wasteFoodType, foodName, quantity, cookedTime, expiryTime, wastageReason } = req.body;

  const createdFood = new Food({
    vegType,
    wasteFoodType,
    foodName: wasteFoodType === "Fresh Food" ? foodName : "N/A",
    quantity,
    cookedTime,
    expiryTime,
    wastageReason,
  });

  try {
    await createdFood.save();
  } catch (err) {
    return next(new HttpError("Food donation failed, please try again later.", 500));
  }

  const createdDonation = new Donation({
    hostelId: req.userData.userId,
    foodId: createdFood.id,
  });

  try {
    await createdDonation.save();
  } catch (err) {
    return next(new HttpError("Failed to add food to donation, please try again later.", 500));
  }


  let recipients;
  let message;
  let type;

  if (wasteFoodType === "Fresh Food") {
    recipients = await User.find({ role: "NGO" }).select("_id email");
    message = `New Fresh Food "${createdFood.foodName}", Quantity: ${createdFood.quantity}Kg is available!`;
    type = "Food Added";
  } else {
    recipients = await User.find({ role: "AWC" }).select("_id email");
    message = `New Plate Waste Food, Quantity: ${createdFood.quantity}Kg is available!`;
    type = "Food Added";
  }


  const notifications = recipients.map((recipient) => ({
    userId: recipient._id,
    message,
    type,
  }));

  await Notification.insertMany(notifications);

 
  recipients.forEach((recipient) => {
   
    req.io.to(recipient._id.toString()).emit("notification", { message, type });

    
    if (recipient.email) {
      foodNotifyMail(createdFood, recipient.email);
    }
  });

  res.status(201).json({
    success: true,
    foodId: createdFood.id,
  });
};





const deleteFood = async (req, res, next) => {
  const { foodId } = req.params;
  const hostelId = req.userData.userId;

  try {
  
    const donation = await Donation.findOne({ foodId, hostelId });
    if (!donation) {
      return next(new HttpError("Donation record not found for this food and hostel.", 404));
    }

   
    await Donation.deleteOne({ _id: donation._id });

    
    const food = await Food.findById(foodId);
    if (food) {
      food.available = false;
      await food.save();
    }

    
    const transaction = await Transaction.findOne({ foodId, status: "Started" });

    if (transaction) {
     
      transaction.status = "Failed";
      transaction.failedDateTime = new Date();
      transaction.otp = null;
      await transaction.save();

   
      const notification = new Notification({
        userId: transaction.receiverId,
        message: `The food donation of ${food.foodName}, ${food.quantity}Kg is not available. Transaction Id: ${transaction._id} `,
        type: "Transaction Failed",
      });

      await notification.save();


    
      req.io.to(transaction.receiverId.toString()).emit("notification", {
        message:  `The food donation of ${food.foodName}, ${food.quantity}Kg is not available. Transaction Id: ${transaction._id} `,
        type: "Transaction Failed",
      });
    }

    res.status(200).json({success: true });
  } catch (err) {
    console.error("Error deleting food donation:", err);
    return next(new HttpError("Failed to update food and transaction, please try again later.", 500));
  }
};

  
  const updateFood = async (req, res, next) => {
  
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }
  
    const {foodId} = req.params;
  
    const {
      vegType,
      wasteFoodType,
      foodName,
      quantity,
      cookedTime,
      expiryTime,
      wastageReason,
      available,
    } = req.body;
  
    let food;
    try {
      food = await Food.findById(foodId);
      if (!food) {
        return next(new HttpError("Food not found, unable to update.", 404));
      }
    } catch (err) {
      return next(new HttpError("Something went wrong, could not update food.", 500));
    }
  
    food.vegType = vegType;
    food.wasteFoodType = wasteFoodType;
    food.foodName = wasteFoodType === "Fresh Food" ? foodName : "N/A";
    food.quantity = quantity;
    food.cookedTime = cookedTime;
    food.expiryTime = expiryTime;
    food.wastageReason = wastageReason;
    food.available = available;
  
    try {
      await food.save();
    } catch (err) {
      return next(new HttpError("Failed to update food, please try again later.", 500));
    }
  
    res.status(200).json({
      success: true,
      food: food.toObject({ getters: true }),
    });
  };

const getFoodById = async (req, res, next) => {
    const foodId = req.params.foodId;
  
    let food;
    try {
      food = await Food.findById(foodId);
      if (!food) {
        return next(new HttpError("Food not found.", 404));
      }
    } catch (err) {
      return next(new HttpError("Something went wrong, could not find food.", 500));
    }
  
    res.status(200).json({ food: food.toObject({ getters: true }) });
  };

  const getAllFoodsByHostel = async (req, res, next) => {
    const hostelId = req.userData.userId;
  
    let donations;
    try {
    
      donations = await Donation.find({ hostelId })
        .populate({ path: "foodId", model: "Food" })
        .lean(); 
    } catch (err) {
      return next(
        new HttpError("Fetching food donations failed, please try again later.", 500)
      );
    }
  
    if (!donations || donations.length === 0) {
      return res.status(200).json({ message: "No food donations found." });
    }
  
    const foodList = donations
      .filter((donation) => donation.foodId) // Ensure populated food exists
      .map((donation) => ({
        ...donation.foodId,
        id: donation.foodId._id.toString(), // Include id as string for consistency
        donateDateTime: donation.donateDateTime, // Include donation time if needed
      }));
  
    res.status(200).json({success: true, foods: foodList });
  };


  const getAllAvailableFoodsByNgo = async (req, res, next) => {
    
    try {
   
      const currentDate = new Date();
  
     
      const availableFoods = await Food.find({
        wasteFoodType: "Fresh Food",
        available: true,
        expiryTime: { $gt: currentDate },
      })
        .lean(); 
  
      if (!availableFoods || availableFoods.length === 0) {
        return res.status(404).json({ message: "No Available food found." });
      }
  
      const foodIds = availableFoods.map((food) => food._id);
  
      const donations = await Donation.find({ foodId: { $in: foodIds } })
        .populate({
          path: "hostelId", // This fetches hostel details from the User model
          select: "organizationName email phone address latitude longitude", // Fetch only required fields
        })
        .lean();
  
    
      const formattedFoods = availableFoods.map((food) => {
        const donation = donations.find((don) => don.foodId.toString() === food._id.toString());
        return {
          ...food,
          donorName: donation?.hostelId?.organizationName || "Unknown Donor",
          donorEmail: donation?.hostelId?.email || "N/A",
          donorPhone: donation?.hostelId?.phone || "N/A",
          donorAddress: donation?.hostelId?.address || "N/A",
          donorLatitude: donation?.hostelId?.latitude || "N/A",
          donorLongitude: donation?.hostelId?.longitude || "N/A",
        };
      });
  
      
      res.status(200).json({
        success: true,
        foods: formattedFoods,
      });
    } catch (err) {
      console.error(err);
      const error = new HttpError(
        "Fetching available foods failed, please try again later.",
        500
      );
      return next(error);
    }
  };

  const getAllAvailableFoodsByAwc = async (req, res, next) => {
    
    try {
    
      const currentDate = new Date();
  
      
      const availableFoods = await Food.find({
        wasteFoodType: "Plate Waste",
        available: true,
        expiryTime: { $gt: currentDate },
      })
        .lean();
  
      if (!availableFoods || availableFoods.length === 0) {
        return res.status(404).json({ message: "No Available food found." });
      }
  
      
      const foodIds = availableFoods.map((food) => food._id);
  
      const donations = await Donation.find({ foodId: { $in: foodIds } })
        .populate({
          path: "hostelId",
          select: "organizationName email phone address latitude longitude", // Fetch only required fields
        })
        .lean();
  
      
      const formattedFoods = availableFoods.map((food) => {
        const donation = donations.find((don) => don.foodId.toString() === food._id.toString());
        return {
          ...food,
          donorName: donation?.hostelId?.organizationName || "Unknown Donor",
          donorEmail: donation?.hostelId?.email || "N/A",
          donorPhone: donation?.hostelId?.phone || "N/A",
          donorAddress: donation?.hostelId?.address || "N/A",
          donorLatitude: donation?.hostelId?.latitude || "N/A",
          donorLongitude: donation?.hostelId?.longitude || "N/A",
        };
      });
  
     
      res.status(200).json({
        success: true,
        foods: formattedFoods,
      });
    } catch (err) {
      console.error(err);
      const error = new HttpError(
        "Fetching available foods failed, please try again later.",
        500
      );
      return next(error);
    }
  };
  


  
  
module.exports = {addFood,deleteFood,updateFood,getFoodById,getAllFoodsByHostel,getAllAvailableFoodsByNgo, getAllAvailableFoodsByAwc};
