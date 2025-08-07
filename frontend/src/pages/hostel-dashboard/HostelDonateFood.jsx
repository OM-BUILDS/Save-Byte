import React, { useState, useEffect, useContext } from "react";
import styles from "./HostelDonateFood.module.css";
import DarkButton from "../../components/DarkButton";
import { useHttpClient } from "../../hooks/http-hook";
import { BASE_API_URL } from "../../api/api";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";
import { useNavigate } from "react-router-dom";
import {
  vegFoodOptions,
  nonVegFoodOptions,
  wastageReasons,
} from "../../data/data";

export default function HostelDonateFood() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vegType: "",
    wasteFoodType: "",
    foodName: "",
    quantity: "",
    cookedTime: "",
    expiryTime: "",
    wastageReason: "",
  });

  const [errors, setErrors] = useState({});

  const foodOptions =
    formData.vegType === "VEG"
      ? vegFoodOptions
      : formData.vegType === "NON-VEG"
      ? nonVegFoodOptions
      : [];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Validate expiry time
  const isExpiryTimeValid = (cookedTime, expiryTime) => {
    if (!cookedTime || !expiryTime) return true;
    const cooked = new Date(cookedTime);
    const expiry = new Date(expiryTime);
    return expiry > cooked;
  };

  // Form validation
  const validateForm = () => {
    let tempErrors = {};

    if (!formData.vegType)
      tempErrors.vegType = "Select vegetarian or non-vegetarian";
    if (!formData.wasteFoodType)
      tempErrors.wasteFoodType = "Select food waste type";
    if (formData.wasteFoodType === "Fresh Food" && !formData.foodName)
      tempErrors.foodName = "Select a food item";
    if (!formData.quantity.match(/^\d+(\.\d{1,2})?$/))
      tempErrors.quantity = "Enter valid quantity in KG";
    if (!formData.cookedTime) tempErrors.cookedTime = "Specify the cooked time";
    if (!formData.expiryTime) tempErrors.expiryTime = "Specify the expiry time";
    if (!formData.wastageReason)
      tempErrors.wastageReason = "Select a wastage reason";

    // Validate expiry time greater than cooked time
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

  // Handle form submission

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (validateForm()) {
      try {
        const response = await sendRequest(
          `${BASE_API_URL}/donate-food`,
          "POST",
          JSON.stringify({
            vegType: formData.vegType,
            wasteFoodType: formData.wasteFoodType,
            foodName: formData.foodName === "Others" ? formData.otherFoodName : formData.foodName,
            quantity: formData.quantity,
            cookedTime: formData.cookedTime,
            expiryTime: formData.expiryTime,
            wastageReason: formData.wastageReason,
          }),
          {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          }
        );

        if (response.success) {
          showSuccessToast("🎉 Food donation recorded successfully!");
          setFormData({
            ...formData,
            cookedTime: "",
            expiryTime: "",
          });
        } else {
          showErrorToast(
            response.message || "❌ Food donation failed. Try again."
          );
        }
      } catch (err) {
        showErrorToast(err.message || "⚠️ Something went wrong!");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DONATE FOOD AND HELP!</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Vegetarian/Non-Vegetarian */}
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

        {/* Fresh Food or Plate Waste */}
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

        {/* Food Name (conditionally hidden for Plate Waste) */}
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
              <option value="Others">Others</option> {/* Added Others option */}
            </select>
            {errors.foodName && (
              <p className={styles.error}>{errors.foodName}</p>
            )}

            {/* If user selects "Others", show a text input */}
            {formData.foodName === "Others" && (
              <input
                type="text"
                name="otherFoodName"
                value={formData.otherFoodName || ""}
                onChange={(e) =>
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    otherFoodName: e.target.value,
                  }))
                }
                placeholder="Enter food name"
                className={styles.input}
              />
            )}
          </div>
        )}

        {/* Quantity in KG */}
        <div className={styles.inputContainer}>
          <label>Quantity (in KG)</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.quantity && <p className={styles.error}>{errors.quantity}</p>}
        </div>

        {/* Cooked Time */}
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

        {/* Expiry Time */}
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

        {/* Wastage Reason */}
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

        {/* Submit Button */}
        <div className={styles.inputContainer}>
          <DarkButton
            type="submit"
            buttonText="Donate Food"
            bgColor="blue"
            color="white"
          />
        </div>
      </form>
    </div>
  );
}
