import React, { useState, useEffect, useContext } from "react";
import styles from "./HostelFoodStatus.module.css";
import DarkButton from "../../components/DarkButton";
import LightButton from "../../components/LightButton";
import { useHttpClient } from "../../hooks/http-hook";
import { BASE_API_URL } from "../../api/api";
import { AuthContext } from "../../context/auth-context";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import HostelEditFood from "./HostelEditFood";

export default function HostelFoodStatus() {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [donatedFoods, setDonatedFoods] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingFood, setEditingFood] = useState(null);
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    fetchDonatedFoods();
  }, [sendRequest, auth.token]);

  const fetchDonatedFoods = async () => {
    try {
      setLoading(true);
      const response = await sendRequest(
        `${BASE_API_URL}/get-all-donated-foods`,
        "GET",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response.success && response.foods) {
        setDonatedFoods(response.foods);
      } else {
        setError("No donated food found.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch donated foods.");
      showErrorToast("⚠️ Error fetching food status!");
    } finally {
      setLoading(false);
    }
  };

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
      setDonatedFoods((prevFoods) =>
        prevFoods.map((food) => ({
          ...food,
          expiredIn: calculateExpiryTime(food.expiryTime),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [donatedFoods]);

  const deleteFoodHandler = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this food?")) {
      return;
    }

    try {
      const response = await sendRequest(
        `${BASE_API_URL}/delete-food/${foodId}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response.success) {
        showSuccessToast(response.message || "✅ Food deleted successfully!");
        fetchDonatedFoods(); // ✅ Re-fetch data after deletion
      } else {
        showErrorToast("⚠️ Failed to delete food. Please try again.");
      }
    } catch (err) {
      showErrorToast(err.message || "⚠️ Something Went Wrong");
    }
  };

  const handleSortChange = (e) => {
    const selectedSortOption = e.target.value;
    setSortOption(selectedSortOption);

    let sortedData = [...donatedFoods];

    switch (selectedSortOption) {
      case "wasteFoodType":
        sortedData.sort((a, b) =>
          a.wasteFoodType.localeCompare(b.wasteFoodType)
        );
        break;

      case "vegType":
        sortedData.sort((a, b) => a.vegType.localeCompare(b.vegType));
        break;

      case "expiredIn":
        sortedData.sort((a, b) => {
          const timeA = a.expiredIn?.milliseconds;
          const timeB = b.expiredIn?.milliseconds;

          // Push expired items to the bottom
          if (a.expiredIn?.text === "Expired") return 1;
          if (b.expiredIn?.text === "Expired") return -1;

          return (timeA || Infinity) - (timeB || Infinity); // Sort ascending by valid time
        });
        break;
      default:
        break;
    }

    setDonatedFoods(sortedData);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>MY DONATED FOOD STATUS</h1>

      <div className={styles.sortContainer}>
        <label htmlFor="sort" className={styles.label}>
          Sort By:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={handleSortChange}
          className={styles.dropdown}
        >
          <option value="">Select an Option</option>
          <option value="wasteFoodType">By Waste Food Type</option>
          <option value="vegType">By Veg Type</option>
          <option value="expiredIn">By Expired In</option>
        </select>
      </div>

      {loading && (
        <p className={styles.loading}>⏳ Loading donated food data...</p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && donatedFoods.length === 0 && (
        <p className={styles.noData}>📭 No food donations found.</p>
      )}

      {!loading && donatedFoods.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Food Name</th>
                <th>Veg Type</th>
                <th>Waste Food Type</th>
                <th>Quantity (KG)</th>
                <th>Availability</th>
                <th>Wastage Reason</th>
                <th>Expiring In</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donatedFoods.map((donation, index) => {
                const isAvailable = donation.available === true;
           
                

                return (
                  <tr key={donation._id}>
                    <td>{index + 1}</td>
                    <td>{donation.foodName}</td>
                    <td>{donation.vegType}</td>
                    <td>{donation.wasteFoodType}</td>
                    <td>{donation.quantity} KG</td>
                    <td>{isAvailable ? "YES" : "NO"}</td>
                    <td>{donation.wastageReason}</td>
                    <td>{isAvailable? (donation.expiredIn?.text || "Expired") : "In Transaction"}</td>
                    <td>
                      <DarkButton
                        buttonText="Delete"
                        onClick={() => deleteFoodHandler(donation._id)}
                      />
                      <LightButton
                        buttonText="Edit"
                        onClick={() => setEditingFood(donation)}
                        disabled={!isAvailable || donation.expiredIn === "Expired"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingFood && (
        <HostelEditFood
          food={editingFood}
          onClose={() => setEditingFood(null)}
          onFoodUpdated={fetchDonatedFoods}
        />
      )}
    </div>
  );
}
