const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Food = require("../models/food");
const User = require("../models/user");
const Donation = require("../models/donation");

const getWastageReport = async (req, res, next) => {
  const hostelId = req.userData.userId;
  const { startDate, endDate } = req.params;

  try {
    
    const donations = await Donation.find({ hostelId })
      .populate({ path: "foodId", model: "Food" })
      .lean();

  
    const filteredDonations = donations.filter((donation) => {
      const food = donation.foodId;
      if (!food || !food.cookedTime) return false;

      const cookedTime = new Date(food.cookedTime);
      if (startDate && endDate) {
        return (
          cookedTime >= new Date(startDate) &&
          cookedTime <= new Date(endDate)
        );
      }
      return true; 
    });

    if (!filteredDonations || filteredDonations.length === 0) {
      return next(
        new HttpError("No donation records found for this hostel.", 404)
      );
    }

  
    const wastageByFoodType = {
      "Fresh Food": 0,
      "Plate Waste": 0,
    };
    const wastageByVegType = {
      VEG: 0,
      "NON-VEG": 0,
    };
    const wastageByFoodName = {};
    const wastageByReasons = {
      "Special Event": 0,
      "Semester Examination": 0,
      "Over Cooking": 0,
      Others: 0,
    };

    
    const wastageByTime = {
      Morning: 0,
      Afternoon: 0,
      Night: 0,
    };

  
    const wastageByDay = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

   
    const wastageByMonth = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

   
    const wastageByDayWithType = {
      Sunday: { FreshFood: 0, PlateWaste: 0 },
      Monday: { FreshFood: 0, PlateWaste: 0 },
      Tuesday: { FreshFood: 0, PlateWaste: 0 },
      Wednesday: { FreshFood: 0, PlateWaste: 0 },
      Thursday: { FreshFood: 0, PlateWaste: 0 },
      Friday: { FreshFood: 0, PlateWaste: 0 },
      Saturday: { FreshFood: 0, PlateWaste: 0 },
    };

  
    filteredDonations.forEach((donation) => {
      const food = donation.foodId;
      if (!food) return;

      const cookedTime = new Date(food.cookedTime);
      const hours = cookedTime.getHours();
      const dayIndex = cookedTime.getDay();
      const monthIndex = cookedTime.getMonth();

     
      wastageByFoodType[food.wasteFoodType] += food.quantity;

      wastageByVegType[food.vegType] += food.quantity;

     
      if (food.wasteFoodType === "Fresh Food") {
        wastageByFoodName[food.foodName] =
          (wastageByFoodName[food.foodName] || 0) + food.quantity;
      }

     
      wastageByReasons[food.wastageReason] += food.quantity;

      if (hours >= 6 && hours < 12) {
       
        wastageByTime.Morning += food.quantity;
      } else if (hours >= 12 && hours < 20) {
      
        wastageByTime.Afternoon += food.quantity;
      } else {
     
        wastageByTime.Night += food.quantity;
      }

     
      const day = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][dayIndex];
      wastageByDay[day] += food.quantity;

 
      if (food.wasteFoodType === "Fresh Food") {
        wastageByDayWithType[day].FreshFood += food.quantity;
      } else if (food.wasteFoodType === "Plate Waste") {
        wastageByDayWithType[day].PlateWaste += food.quantity;
      }

     
      const month = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][monthIndex];
      wastageByMonth[month] += food.quantity;
    });

    const formatToFixed = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === "number") {
          obj[key] = parseFloat(obj[key].toFixed(1));
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          formatToFixed(obj[key]);
        }
      }
    };

  
    formatToFixed(wastageByFoodType);
    formatToFixed(wastageByVegType);
    formatToFixed(wastageByFoodName);
    formatToFixed(wastageByReasons);
    formatToFixed(wastageByTime);
    formatToFixed(wastageByDay);
    formatToFixed(wastageByMonth);
    formatToFixed(wastageByDayWithType);

   
    res.status(200).json({
      success: true,
      wastageByFoodType,
      wastageByVegType,
      wastageByFoodName,
      wastageByReasons,
      wastageByTime,
      wastageByDay,
      wastageByMonth,
      wastageByDayWithType, 
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Failed to generate wastage report.", 500));
  }
};

module.exports = { getWastageReport };
