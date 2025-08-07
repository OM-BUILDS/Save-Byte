import React, { useState, useEffect} from "react";
import styles from "./RegistrationForm.module.css";
import LightButton from "../components/LightButton";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useHttpClient } from "../hooks/http-hook";
import { BASE_API_URL } from "../api/api";
import { showSuccessToast, showErrorToast } from "../utils/toast";


export default function RegistrationForm() {


  const location = useLocation();
  const { state } = location;
  const { sendRequest } = useHttpClient();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    role: state,
    organizationName: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    latitude:"",
    longitude:""
  });

  const [errors, setErrors] = useState({});

  const hostelOptions = [
    "CMH Hostel",
    "NMH Hostel",
    "KMH Hostel",
    "Jiri Hostel",
    "Patkai Hostel",
  ];

  // Get user coordinates when the component loads
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Location access denied! Please enable location to proceed.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.role)
      tempErrors.organization = "Select an organization";
    if (formData.role !== "Hostel" && !formData.organizationName)
      tempErrors.name = "Organization Name is required";
    if (formData.role === "Hostel" && !formData.organizationName)
      tempErrors.hostelName = "Select hostel name";
    if (!formData.address) tempErrors.address = "Address is required";
    if (!formData.phone.match(/^\d{10}$/))
      tempErrors.phone = "Enter a valid 10-digit phone number";
    if (!formData.email.match(/^\S+@\S+\.\S+$/))
      tempErrors.email = "Enter a valid email";
    if (formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      tempErrors.confirmPassword = "Passwords do not match";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Updated handleSubmit with toast notifications
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (validateForm()) {
    try {
      const response = await sendRequest(
        `${BASE_API_URL}/register`,
        "POST",
        JSON.stringify({
          role: formData.role,
          organizationName: formData.organizationName,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
        { "Content-Type": "application/json" }
      );

      if (response && response.userId) {
        showSuccessToast("🎉 Registration Successful!");
        navigate("/login");
      } else {
        console.log(response);
        showErrorToast(response.message || "❌ Registration failed. Try again.");
      }
    } catch (err) {
      showErrorToast(err.message || "⚠️ Something went wrong!");

    }
  }
};

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>JOIN US AND HELP!</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Organization */}
        <div className={styles.inputContainer}>
          <label>Organization</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="">Select Organization</option>
            <option value="HOSTEL">HOSTEL</option>
            <option value="NGO">NGO</option>
            <option value="AWC">AWC</option>
          </select>
          {errors.role && (
            <p className={styles.error}>{errors.role}</p>
          )}
        </div>

        {/* Hostel Name or Name */}
        {formData.role === "HOSTEL" ? (
          <div className={styles.inputContainer}>
            <label>Hostel Name</label>
            <select
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Select Hostel</option>
              {hostelOptions.map((hostel, index) => (
                <option key={index} value={hostel}>
                  {hostel}
                </option>
              ))}
            </select>
            {errors.hostelName && (
              <p className={styles.error}>{errors.hostelName}</p>
            )}
          </div>
        ) : (
          <div className={styles.inputContainer}>
            <label>Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.organizationName && <p className={styles.error}>{errors.organizationName}</p>}
          </div>
        )}

        {/* Other input fields remain unchanged */}

        {/* Password */}
        <div className={styles.inputContainer}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
          />

          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className={styles.inputContainer}>
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={styles.input}
          />

          {errors.confirmPassword && (
            <p className={styles.error}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Phone */}
        <div className={styles.inputContainer}>
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
          />

          {errors.phone && <p className={styles.error}>{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className={styles.inputContainer}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />

          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        {/* Address */}
        <div className={styles.inputContainer}>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={styles.input}
          />

          {errors.address && <p className={styles.error}>{errors.address}</p>}
        </div>

        {/* Location Information (Hidden) */}
        <input
          type="hidden"
          name="latitude"
          value={formData.latitude}
        />
        <input
          type="hidden"
          name="longitude"
          value={formData.longitude}
        />

        <LightButton type="submit" buttonText="Register" />
        <Link to="/login">Already have an account?</Link>
      </form>
    </div>
  );
}
