import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from "./NgoAvailableFoods.module.css";
import DarkButton from "../../components/DarkButton";
import LightButton from "../../components/LightButton";
import { useHttpClient } from "../../hooks/http-hook";
import { BASE_API_URL } from "../../api/api";
import { AuthContext } from "../../context/auth-context";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

export default function NgoAvailableFoods() {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [availableFoods, setAvailableFoods] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [receiverCoords, setReceiverCoords] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  const apiKey = "02f139a2a1d147f1a46d19124de1d746";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Fetched Receiver Location:", position.coords);
          setReceiverCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
          setError("Failed to get accurate location. Enable GPS and retry.");
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 } // ⬅️ Increased timeout
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);
  

 const calculateExpiryTime = (expiryTime) => {
     if (!expiryTime) return "N/A";
 
     const now = new Date();
     const expiry = new Date(expiryTime);
     const diffMs = expiry - now;
 
     if (diffMs <= 0) return "Expired";
 
     const hours = Math.floor(diffMs / (1000 * 60 * 60));
     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
     const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
 
     return { text: `${hours}h ${minutes}m ${seconds}s`, milliseconds: diffMs };
   };
 
   useEffect(() => {
     const interval = setInterval(() => {
       setAvailableFoods((prevFoods) =>
         prevFoods.map((food) => ({
           ...food,
           expiredIn: calculateExpiryTime(food.expiryTime),
         }))
       );
     }, 1000);
 
     return () => clearInterval(interval);
   }, [availableFoods]);
  

  // 🍽️ Fetch available foods and calculate routes
  useEffect(() => {
    const fetchAvailableFoods = async () => {
      try {
        const response = await sendRequest(
          `${BASE_API_URL}/get-all-ngo-available-foods`,
          "GET",
          null,
          { Authorization: "Bearer " + auth.token }
        );

        if (response.success) {
          const foodsWithRoutes = await Promise.all(
            response.foods.map(async (food) => {
              const routeData = receiverCoords
                ? await fetchRoute(food)
                : { distance: "N/A", estimatedTime: "N/A" };
              return { ...food, ...routeData };
            })
          );

          setAvailableFoods(foodsWithRoutes);
          showSuccessToast("✅ Available Foods fetched successfully!");
        } else {
          setError("No available food found.");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch available foods.");
        showErrorToast("⚠️ Error fetching available foods!");
      } finally {
        setLoading(false);
      }
    };

    if (receiverCoords) fetchAvailableFoods();
  }, [sendRequest, auth.token, receiverCoords]);

  
  const fetchRoute = async (food) => {
    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${food.donorLatitude},${food.donorLongitude}|${receiverCoords.latitude},${receiverCoords.longitude}&mode=drive&apiKey=${apiKey}`;
      const response = await axios.get(url);

      if (response.data.features?.length > 0) {
        const feature = response.data.features[0];
        return {
          distance: (feature.properties.distance / 1000).toFixed(2), // Convert meters to km
          estimatedTime: Math.round(feature.properties.time / 60), // Convert seconds to minutes
        };
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
    return { distance: "N/A", estimatedTime: "N/A" }; // Default if error
  };

  const handleAccept = async (foodId) => {
    try {
      const response = await sendRequest(
        `${BASE_API_URL}/accept-food/${foodId}`,
        "POST",
        JSON.stringify({ receiverId: auth.userId }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response.success) {
        showSuccessToast("✅ An OTP has been sent in your email. Please use this for verification.");
        setAvailableFoods((prevFoods) =>
          prevFoods.map((food) =>
            food._id === foodId ? { ...food, available: false } : food
          )
        );
      }
    } catch (err) {
      showErrorToast(err.message || "Failed to accept food.");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AVAILABLE FOODS!</h1>

      {loading && (
        <p className={styles.loading}>⏳ Loading Available food data...</p>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && availableFoods.length === 0 && (
        <p className={styles.noData}>📭 No food donations found.</p>
      )}

      {!loading && availableFoods.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hostel Name</th>
                <th>Food Name</th>
                <th>Veg Type</th>
                <th>Quantity (KG)</th>
                <th>Expired In</th>
                <th>Distance (KM)</th>
                <th>Estimated Time (Min)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {availableFoods.map((available) => (
                <tr
                  key={available._id}
                  className={
                    available.available === false ? styles.unavailableRow : ""
                  }
                >
                  <td>{available.donorName}</td>
                  <td>{available.foodName}</td>
                  <td>{available.vegType}</td>
                  <td>{available.quantity} KG</td>
                  <td>{available.expiredIn?.text || "Expired"}</td>
                  <td>{available.distance ? `${available.distance} KM` : "N/A"}</td>
                  <td>{available.estimatedTime ? `${available.estimatedTime} Min` : "N/A"}</td>
                  <td>
                    {available.available !== false && (
                      <DarkButton
                        buttonText="Accept"
                        onClick={() => handleAccept(available._id)}
                      />
                    )}
                    <LightButton
                      onClick={() => setSelectedFood(available)}
                      buttonText="View Details"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
      
      {selectedFood && (
            <div className={styles.modal}>
              <h2>Food Details</h2>
              <p><strong>Food Name:</strong> {selectedFood.foodName}</p>
              <p><strong>Cooked Time:</strong> {formatDateTime(selectedFood.cookedTime)}</p>
              <p><strong>Quantity:</strong> {selectedFood.quantity}</p>
              <p><strong>Donor:</strong> {selectedFood.donorName}</p>
              <p><strong>Phone:</strong> {selectedFood.donorPhone}</p>
              <p><strong>Email:</strong> {selectedFood.donorEmail}</p>
              <p><strong>Address:</strong> {selectedFood.donorAddress}</p>
              <button onClick={() => setSelectedFood(null)}>Close</button>
            </div>
          )}
    </div>
  );
}
