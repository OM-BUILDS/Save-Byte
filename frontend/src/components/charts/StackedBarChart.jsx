import React, { useState, useEffect, useContext } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; 
import styles from "./TrendChart.module.css"; 
import { BASE_API_URL } from "../../api/api";
import { useHttpClient } from "../../hooks/http-hook";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";

export default function StackedBarChart({ hostelId }) {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  
  const [chartData, setChartData] = useState({});
  const [peakDay, setPeakDay] = useState("");


  useEffect(() => {
    fetchWastageData(); // Initial fetch
  }, []);

  const fetchWastageData = async () => {
    try {
      const url = `${BASE_API_URL}/get-wastage-report`;

      const response = await sendRequest(url, "GET", null, {
        Authorization: "Bearer " + auth.token,
      });

      if (response.success && response.wastageByDayWithType) {
        updateChartData(response.wastageByDayWithType);
        findPeakDay(response.wastageByDayWithType);
      }
    } catch (err) {
      showErrorToast("⚠️ Error fetching wastage data.");
    }
  };

 
  const updateChartData = (data) => {
    if (!data) return;

    const labels = Object.keys(data); // Days: Mon, Tue, etc.
    const freshFoodData = labels.map((day) => data[day].FreshFood || 0);
    const plateWasteData = labels.map((day) => data[day].PlateWaste || 0);

    setChartData({
      labels,
      datasets: [
        {
          label: "Fresh Food Wastage (kg)",
          data: freshFoodData,
          backgroundColor: "#42ba96", // Green for Fresh Food
          borderColor: "#fff",
          borderWidth: 2,
        },
        {
          label: "Plate Waste (kg)",
          data: plateWasteData,
          backgroundColor: "#ff9f40", // Orange for Plate Waste
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    });
  };

 
  const findPeakDay = (data) => {
    if (!data) return;

    const totalWastagePerDay = Object.keys(data).map(
      (day) => (data[day].FreshFood || 0) + (data[day].PlateWaste || 0)
    );
    const peakDayIndex = totalWastagePerDay.indexOf(Math.max(...totalWastagePerDay));
    const peakDayLabel = Object.keys(data)[peakDayIndex];

    setPeakDay(peakDayLabel);
  };

 
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#333",
          font: { size: 14, weight: "bold" },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const total = tooltipItem.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.dataset.label}: ${value} kg (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "#333", font: { size: 12, weight: "bold" } },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: { color: "#333", font: { size: 12, weight: "bold" } },
        grid: { color: "#d1e3e6" },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.headerContainer}>
      
        <div className={styles.trendContainer}>
          <h3>
            Peak Wastage Day:{" "}
            <span className={styles.trend}>{peakDay || "N/A"}</span>
          </h3>
        </div>
      </div>

      
      <div className={styles.chartWrapper}>
        {chartData.labels ? (
          <Bar data={chartData} options={chartOptions} height={400} />
        ) : (
          <p className={styles.noData}>No data available for chart.</p>
        )}
      </div>
    </div>
  );
}
