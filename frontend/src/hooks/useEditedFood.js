import React, { useState, useContext } from "react";
import { useHttpClient } from "./http-hook";
import { BASE_API_URL } from "../api/api";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import { AuthContext } from "../context/auth-context";



export default function useEditedFood() {
const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [formData, setFormData] = useState({
    vegType: food.vegType || "",
    wasteFoodType: food.wasteFoodType || "",
    foodName: food.foodName || "",
    quantity: food.quantity || "",
    cookedTime: food.cookedTime ? food.cookedTime.slice(0, 16) : "",
    expiryTime: food.expiryTime ? food.expiryTime.slice(0, 16) : "",
    wastageReason: food.wastageReason || "",
    available: food.available ? "Yes" : "No", 
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    const newValue =
      name === "available" ? (value === "Yes" ? true : false) : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));
  };

  const isExpiryTimeValid = (cookedTime, expiryTime) => {
    if (!cookedTime || !expiryTime) return true;
    const cooked = new Date(cookedTime);
    const expiry = new Date(expiryTime);
    return expiry > cooked;
  };

 
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
      if (response.message) {
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

  return {handleChange,handleSubmit,errors,formData};
  
}
