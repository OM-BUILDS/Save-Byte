import React, { useState, useEffect, useContext } from "react";
import styles from "./HostelCards.module.css"; // ✅ CSS for cards
import { BASE_API_URL } from "../api/api";
import { useHttpClient } from "../hooks/http-hook";
import { showErrorToast } from "../utils/toast";
import { AuthContext } from "../context/auth-context";
import { FaLeaf, FaUtensils, FaChartLine } from "react-icons/fa"; // ✅ Icons for cards

export default function HostelCards() {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  // ✅ State to store fetched data
  const [wastageData, setWastageData] = useState({});
  const [currentWeekData, setCurrentWeekData] = useState({});
  const [lastWeekData, setLastWeekData] = useState({});
  const [loading, setLoading] = useState(true);

  // 🎯 Fetch data on component load
  useEffect(() => {
    fetchWastageData();
  }, []);

  // 📚 Fetch Current and Last Week Data
  const fetchWastageData = async () => {
    try {
      // ✅ Fetch total wastage data
      const response = await sendRequest(
        `${BASE_API_URL}/get-wastage-report`,
        "GET",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      // ✅ Fetch current week's data
      const currentWeekDates = getCurrentWeekDates();
      const currentWeekResponse = await sendRequest(
        `${BASE_API_URL}/get-wastage-report/${currentWeekDates.startDate}/${currentWeekDates.endDate}`,
        "GET",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      // ✅ Fetch last week's data
      const lastWeekDates = getLastWeekDates();
      const lastWeekResponse = await sendRequest(
        `${BASE_API_URL}/get-wastage-report/${lastWeekDates.startDate}/${lastWeekDates.endDate}`,
        "GET",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response.success && currentWeekResponse && lastWeekResponse) {
        console.log("📊 Overall Data:", response);
        console.log("📅 Current Week Data:", currentWeekResponse);
        console.log("📅 Last Week Data:", lastWeekResponse);

        setWastageData(response);
        setCurrentWeekData(currentWeekResponse);
        setLastWeekData(lastWeekResponse);
        setLoading(false);
      }
    } catch (err) {
      console.error("⚠️ Error fetching wastage data:", err);
      showErrorToast("⚠️ Error fetching wastage data.");
    }
  };

  // 📅 Get Last Week Dates (Sunday to Saturday)
  const getLastWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Get current day of the week (0 for Sunday, 6 for Saturday)

    // Move to last Sunday
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - dayOfWeek - 7); // Move 7 days back
    lastSunday.setHours(0, 0, 0, 0);
    console.log(lastSunday);

    // Move to next Saturday (end of last week)
    const lastWeekEnd = new Date(lastSunday);
    lastWeekEnd.setDate(lastSunday.getDate() + 6); // Add 6 days to reach Saturday
    lastWeekEnd.setHours(23, 59, 59, 999);

    console.log(lastSunday.toISOString().split("T")[0]);
    console.log(lastWeekEnd.toISOString().split("T")[0]);

    return {
      startDate: lastSunday.toISOString().split("T")[0],
      endDate: lastWeekEnd.toISOString().split("T")[0],
    };
  };

  // 📅 Get Current Week Dates (Sunday to Saturday)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Get current day of the week (0 for Sunday, 6 for Saturday)

    // Move to this week's Sunday (start of the week)
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - dayOfWeek); // Move to the start of this week
    currentSunday.setHours(0, 0, 0, 0);

    // Move to this Saturday (end of the week)
    const currentWeekEnd = new Date(currentSunday);
    currentWeekEnd.setDate(currentSunday.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    console.log(currentSunday.toISOString().split("T")[0]);
    console.log(currentWeekEnd.toISOString().split("T")[0]);

    return {
      startDate: currentSunday.toISOString().split("T")[0],
      endDate: currentWeekEnd.toISOString().split("T")[0],
    };
  };

  // 📊 Calculate Percentage Change
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return "N/A"; // No change if previous is zero
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(2);
  };

  // 📊 Define Data for Cards (Only currentWeekData vs. lastWeekData for percentage change)
  const cardData = [
    {
      title: "Total Food Wastage",
      totalQuantity:
          wastageData.wastageByFoodType?.["Fresh Food"] +
          wastageData.wastageByFoodType?.["Plate Waste"] || 0,
      subTitle:"This Week Wastage",
      thisWeekQuantity:
        currentWeekData.wastageByFoodType?.["Fresh Food"] +
          currentWeekData.wastageByFoodType?.["Plate Waste"] || 0,
      lastWeek:
        lastWeekData.wastageByFoodType?.["Fresh Food"] +
          lastWeekData.wastageByFoodType?.["Plate Waste"] || 0,
      icon: <FaChartLine className={styles.icon} />,
    },
    {
      title: "Plate Waste Wastage",
      totalQuantity:wastageData.wastageByFoodType?.["Plate Waste"] || 0,
      subTitle:"This Week Wastage",
      thisWeekQuantity: currentWeekData.wastageByFoodType?.["Plate Waste"] || 0,
      lastWeek: lastWeekData.wastageByFoodType?.["Plate Waste"] || 0,
      icon: <FaUtensils className={styles.icon} />,
    },
    {
      title: "Fresh Food Wastage",
      totalQuantity:wastageData.wastageByFoodType?.["Fresh Food"] || 0,
      subTitle:"This Week Wastage",
      thisWeekQuantity: currentWeekData.wastageByFoodType?.["Fresh Food"] || 0,
      lastWeek: lastWeekData.wastageByFoodType?.["Fresh Food"] || 0,
      icon: <FaLeaf className={styles.icon} />,
    },
  ];

  return (
    <div className={styles.cardContainer}>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        cardData.map((card, index) => {
          const percentageChange = calculatePercentageChange(
            card.thisWeekQuantity,
            card.lastWeek
          );
          const isIncrease = percentageChange > 0;

          return (
            <div key={index} className={styles.card}>
              <div className={styles.iconContainer}>{card.icon}</div>
              <div className={styles.cardContent}>
                <div className={styles.totalQuantityContainer}>
                <h3>{card.title}</h3>
                <p className={styles.totalQuantity}>{card.totalQuantity} kg</p>
                </div>
                <div className={styles.thisWeekQuantityContainer}>
                <h4>{card.subTitle}</h4>
                <p className={styles.thisWeekQuantity}>{card.thisWeekQuantity} kg</p>
                </div>
                <div
                  className={`${styles.percentageChangeContainer} ${
                    isIncrease ? styles.increase : styles.decrease
                  }`}
                >
                 <span> {isIncrease ? "+" : ""}
                  {percentageChange}%</span> <p>than last week</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
