import React, { useState, useEffect, useContext } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+
import styles from "./TrendChart.module.css"; // ✅ CSS for styling
import { BASE_API_URL } from "../../api/api";
import { useHttpClient } from "../../hooks/http-hook";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";

export default function VerticalChart({ hostelId }) {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  // ✅ State for fetched data & chart config
  const [chartData, setChartData] = useState({});
  const [peakDay, setPeakDay] = useState("");

  // 🎯 Fetch wastage data by day
  useEffect(() => {
    fetchWastageByDay(); // Initial fetch
  }, []);

  // 📚 Fetch data for Wastage by Day
  const fetchWastageByDay = async () => {
    try {
      const url = `${BASE_API_URL}/get-wastage-report`;

      const response = await sendRequest(url, "GET", null, {
        Authorization: "Bearer " + auth.token,
      });

      if (response.success && response.wastageByDay) {
        updateChartData(response.wastageByDay);
        findPeakDay(response.wastageByDay);
      }
    } catch (err) {
      showErrorToast("⚠️ Error fetching wastage data by day.");
    }
  };

  // 📊 Format and update chart data
  const updateChartData = (data) => {
    if (!data) return;

    const labels = Object.keys(data);
    const values = Object.values(data);

    setChartData({
      labels,
      datasets: [
        {
          label: "Wastage Quantity (kg)",
          data: values,
          backgroundColor: [
            "#FF6384", // Monday - Red
            "#36A2EB", // Tuesday - Blue
            "#FFCE56", // Wednesday - Yellow
            "#4BC0C0", // Thursday - Teal
            "#9966FF", // Friday - Purple
            "#FF9F40", // Saturday - Orange
            "#8D6E63", // Sunday - Brown
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    });
  };

  // 📈 Identify Peak Wastage Day
  const findPeakDay = (data) => {
    if (!data) return;

    const entries = Object.entries(data);
    const maxDay = entries.reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    );
    setPeakDay(maxDay[0]);
  };

  // 📊 Chart Options for Better UI
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
            return `${tooltipItem.label}: ${value} kg (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#333", font: { size: 12, weight: "bold" } },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#333", font: { size: 12, weight: "bold" } },
        grid: { color: "#d1e3e6" },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.headerContainer}>
        {/* 🔥 Peak Wastage Day */}
        <div className={styles.trendContainer}>
          <h3>
            Peak Wastage Day:{" "}
            <span className={styles.trend}>{peakDay || "N/A"}</span>
          </h3>
        </div>
      </div>

      {/* 📊 Vertical Bar Chart for Wastage by Day */}
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
