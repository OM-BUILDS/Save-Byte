import React, { useState,useContext } from "react";
import styles from "./LogIn.module.css";
import DarkButton from "../components/DarkButton";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha"
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import {BASE_API_URL} from '../api/api';
import { showSuccessToast, showErrorToast } from "../utils/toast";


export default function LogIn() {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: state || "",
    email:"",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Captcha verification handler
  const handleCaptcha = (value) => {
    setCaptchaVerified(true);
  };

  // Form validation
  const validateForm = () => {
    let tempErrors = {};

    if (!formData.organization)
      tempErrors.organization = "Select an organization";
    if (formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      tempErrors.confirmPassword = "Passwords do not match";
    if (!captchaVerified) tempErrors.captcha = "Please verify captcha";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendRequest(
        BASE_API_URL + "/login",
        "POST",
        JSON.stringify({
          role: formData.role,
          email: formData.email,
          password: formData.password,
        }),
        {
          "Content-Type": "application/json",
        }
      );
  
      if (response.userId) {
        showSuccessToast("✅ Login successful!");
        console.log(response);
  
        // 🟢 Save auth data in context
        auth.login(response.userId, response.token);
  
        // ✅ Check role and navigate accordingly
        switch (response.role) {
          case "HOSTEL":
            navigate("/hostel-dashboard", {
              state:response.organizationName ,
            });
            break;
          case "NGO":
            navigate("/ngo-dashboard", {
              state: response.organizationName,
            });
            break;
          case "AWC":
            navigate("/awc-dashboard", {
              state:response.organizationName ,
            });
            break;
          default:
            navigate("/home")
            break;
        }
      } else {
        showErrorToast(response.message || "❌ Invalid credentials. Try again.");
        return;
      }
    } catch (err) {
      showErrorToast(err.message || "⚠️ Something went wrong!");
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>LOG IN AND SAVE BYTE!! 🚀</h1>
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
          {errors.organization && (
            <p className={styles.error}>{errors.organization}</p>
          )}
        </div>

        {/* Username */}
        <div className={styles.inputContainer}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.username}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter your Email"
          />
          {errors.username && (
            <p className={styles.error}>{errors.username}</p>
          )}
        </div>

        {/* Password */}
        <div className={styles.inputContainer}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className={styles.error}>{errors.password}</p>
          )}
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
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className={styles.error}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* reCAPTCHA */}
        <div className={styles.inputContainer}>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={handleCaptcha}
          />
          {errors.captcha && (
            <p className={styles.error}>{errors.captcha}</p>
          )}
        </div>

        {/* Submit Button */}
        <DarkButton
          type="submit"
          buttonText="Login"
          bgColor="blue"
          color="white"
        />

        {/* Reset Password Link */}
        <div className={styles.linkContainer}>
          <Link to="/reset-password" className={styles.link}>
            Forgot your password?
          </Link>
        </div>

        {/* Sign-up Link */}
        <div className={styles.linkContainer}>
          <Link to="/register" className={styles.link}>
            Not have an account? Register here.
          </Link>
        </div>
      </form>
    </div>
  );
}
