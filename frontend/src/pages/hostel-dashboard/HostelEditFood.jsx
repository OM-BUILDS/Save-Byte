import React, { useState, useEffect,useContext } from "react";
import styles from "./HostelEditFood.module.css";
import LightButton from "../../components/LightButton";
import DarkButton from "../../components/DarkButton";
import { useHttpClient } from "../../hooks/http-hook";
import { BASE_API_URL } from "../../api/api";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";
import { vegFoodOptions,nonVegFoodOptions, wastageReasons} from "../../data/data";

export default function HostelEditFood({ food, onClose, onFoodUpdated }) {
const auth = useContext(AuthContext);

  const { sendRequest } = useHttpClient();
  // 📦 Initializing form data with existing values
  const [formData, setFormData] = useState({
    vegType: food.vegType || "",
    wasteFoodType: food.wasteFoodType || "",
    foodName: food.foodName || "",
    quantity: food.quantity || "",
    cookedTime: food.cookedTime ? food.cookedTime.slice(0, 16) : "",
    expiryTime: food.expiryTime ? food.expiryTime.slice(0, 16) : "",
    wastageReason: food.wastageReason || "",
    available: food.available ? "Yes" : "No", // ✅ Pre-filled based on food availability
  });

  const [errors, setErrors] = useState({});

   const foodOptions =
   formData.vegType === "VEG" ? vegFoodOptions : 
   formData.vegType === "NON-VEG" ? nonVegFoodOptions : [];

  // 🎯 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert 'Yes' or 'No' to boolean for available
    const newValue =
      name === "available" ? (value === "Yes" ? true : false) : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));
  };

  // 📅 Validate expiry time > cooked time
  const isExpiryTimeValid = (cookedTime, expiryTime) => {
    if (!cookedTime || !expiryTime) return true;
    const cooked = new Date(cookedTime);
    const expiry = new Date(expiryTime);
    return expiry > cooked;
  };

  // ✅ Form validation
  const validateForm = () => {
    let tempErrors = {};

    if (!formData.vegType)
      tempErrors.vegType = "Select vegetarian or non-vegetarian";
    if (!formData.wasteFoodType)
      tempErrors.wasteFoodType = "Select food waste type";
    if (formData.wasteFoodType === "Fresh Food" && !formData.foodName)
      tempErrors.foodName = "Select a food item";
    if (!String(formData.quantity).match(/^\d+(\.\d{1,2})?$/)) {
        tempErrors.quantity = "Enter valid quantity in KG";
      }
    if (!formData.cookedTime) tempErrors.cookedTime = "Specify cooked time";
    if (!formData.expiryTime) tempErrors.expiryTime = "Specify expiry time";
    if (!formData.wastageReason)
      tempErrors.wastageReason = "Select a wastage reason";

    // ✅ Validate cooked and expiry time
    if (
      formData.cookedTime &&
      formData.expiryTime &&
      !isExpiryTimeValid(formData.cookedTime, formData.expiryTime)
    ) {
      tempErrors.expiryTime =
        "Expiry time must be greater than the cooked time";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // 🚀 Handle form submission (PUT request to update food)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate form before submission
    if (!validateForm()) {
      showErrorToast("⚠️ Please fix the form errors.");
      return;
    }
  
    try {
      // Send PUT request to update food data
      const response = await sendRequest(
        `${BASE_API_URL}/update-food/${food._id}`, // ✅ Correct API endpoint
        "PUT",
        JSON.stringify({
          vegType: formData.vegType,
          wasteFoodType: formData.wasteFoodType,
          foodName: formData.wasteFoodType === "Fresh Food" ? formData.foodName : "N/A", // Set 'N/A' for Plate Waste
          quantity: parseFloat(formData.quantity), // Convert quantity to float
          cookedTime: formData.cookedTime,
          expiryTime: formData.expiryTime,
          wastageReason: formData.wastageReason,
          available: formData.available === "Yes", // ✅ Convert 'Yes' to true, 'No' to false
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token, // ✅ Authorization header
        }
      );
  
      // Handle successful response
      if (response.success) {
        showSuccessToast(response.message || "✅ Food updated successfully!");
        onFoodUpdated(response.food); // ✅ Pass updated food to parent
        onClose(); // ✅ Close modal on success
      } else {
        showErrorToast(response.message || "❌ Failed to update food.");
      }
    } catch (err) {
      showErrorToast("⚠️ Error updating food. Try again!");
    }
  };
  

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Edit Food Details</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* 🌱 Veg / Non-Veg */}
          <div className={styles.inputContainer}>
            <label>Type of Food</label>
            <select
              name="vegType"
              value={formData.vegType}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Select Type</option>
              <option value="VEG">Vegetarian</option>
              <option value="NON-VEG">Non-Vegetarian</option>
            </select>
            {errors.vegType && <p className={styles.error}>{errors.vegType}</p>}
          </div>

          {/* 🥡 Food Waste Type */}
          <div className={styles.inputContainer}>
            <label>Food Waste Type</label>
            <select
              name="wasteFoodType"
              value={formData.wasteFoodType}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Select Waste Type</option>
              <option value="Fresh Food">Fresh Food</option>
              <option value="Plate Waste">Plate Waste</option>
            </select>
            {errors.wasteFoodType && (
              <p className={styles.error}>{errors.wasteFoodType}</p>
            )}
          </div>

          {/* 🍛 Food Name (only for Fresh Food) */}
          {formData.wasteFoodType === "Fresh Food" && (
            <div className={styles.inputContainer}>
              <label>Food Name</label>
              <select
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Select Food</option>
                {foodOptions.map((food, index) => (
                  <option key={index} value={food}>
                    {food}
                  </option>
                ))}
              </select>
              {errors.foodName && (
                <p className={styles.error}>{errors.foodName}</p>
              )}
            </div>
          )}

          {/* ⚖️ Quantity */}
          <div className={styles.inputContainer}>
            <label>Quantity (in KG)</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.quantity && (
              <p className={styles.error}>{errors.quantity}</p>
            )}
          </div>

          {/* ⏱️ Cooked Time */}
          <div className={styles.inputContainer}>
            <label>Cooked Time</label>
            <input
              type="datetime-local"
              name="cookedTime"
              value={formData.cookedTime}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.cookedTime && (
              <p className={styles.error}>{errors.cookedTime}</p>
            )}
          </div>

          {/* ⏳ Expiry Time */}
          <div className={styles.inputContainer}>
            <label>Expiry Time</label>
            <input
              type="datetime-local"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.expiryTime && (
              <p className={styles.error}>{errors.expiryTime}</p>
            )}
          </div>

          {/* 📉 Wastage Reason */}
          <div className={styles.inputContainer}>
            <label>Wastage Reason</label>
            <select
              name="wastageReason"
              value={formData.wastageReason}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Select Reason</option>
              {wastageReasons.map((reason, index) => (
                <option key={index} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.wastageReason && (
              <p className={styles.error}>{errors.wastageReason}</p>
            )}
          </div>

          {/* 🟢 Available Dropdown */}
          <div className={styles.inputContainer}>
            <label>Is Food Available?</label>
            <input
              name="available"
              value={formData.available ? "Yes" : "No"}
              className={styles.input}
              readonly
            >
            </input>
          </div>

          {/* 🔘 Submit / Cancel Buttons */}
          <div className={styles.inputContainer}>
            <LightButton
              type="submit"
              buttonText="Update Food"
              bgColor="green"
              color="white"
            />
            <DarkButton
              type="button"
              buttonText="Cancel"
              bgColor="red"
              color="white"
              onClick={onClose} // ✅ Fixed Cancel Button
            />
          </div>
        </form>
      </div>
    </div>
  );
}
