import React, { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+
import styles from "./TrendChart.module.css"; // ✅ CSS for styling
import { BASE_API_URL } from "../../api/api";
import { useHttpClient } from "../../hooks/http-hook";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";

export default function TrendChart({ hostelId }) {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  // ✅ State for fetched data & chart config
  const [chartData, setChartData] = useState({});
  const [trendDirection, setTrendDirection] = useState("");

  // 🎯 Fetch wastage data by month
  useEffect(() => {
    fetchWastageByMonth(); // Initial fetch
  }, []);

  // 📚 Fetch data for Wastage by Month
  const fetchWastageByMonth = async () => {
    try {
      const url = `${BASE_API_URL}/get-wastage-report`;

      const response = await sendRequest(url, "GET", null, {
        Authorization: "Bearer " + auth.token,
      });

      if (response.success && response.wastageByMonth) {
        updateChartData(response.wastageByMonth);
        calculateTrend(response.wastageByMonth);
      }
    } catch (err) {
      showErrorToast("⚠️ Error fetching wastage data.");
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
          borderColor: trendDirection.includes("Increasing")
            ? "#28a745"
            : "#dc3545",
          backgroundColor: trendDirection.includes("Increasing")
            ? "rgba(40, 167, 69, 0.2)"
            : "rgba(220, 53, 69, 0.2)",
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: trendDirection.includes("Increasing")
            ? "#28a745"
            : "#dc3545",
        },
      ],
    });
  };

  // 📏 Calculate Trend Direction (Increase/Decrease)
  const calculateTrend = (data) => {
    if (!data) return;
    const values = Object.values(data);
    if (values.length < 2) {
      setTrendDirection("⚠️ Insufficient data to determine trend.");
      return;
    }

    const start = values[0];
    const end = values[values.length - 1];

    if (end > start) {
      setTrendDirection("📈 Increasing Trend");
    } else if (end < start) {
      setTrendDirection("📉 Decreasing Trend");
    } else {
      setTrendDirection("➡️ No Significant Change");
    }
  };

  // 📊 Chart Options for Better UI
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#ddd",
        borderWidth: 1,
        titleColor: "#333",
        bodyColor: "#555",
        bodyFont: { weight: "bold" },
        padding: 12,
      },
      legend: {
        display: true,
        labels: {
          color: "#333",
          font: { size: 14, weight: "bold" },
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
        
        <div className={styles.trendContainer}>
          <h3>
            Trend: <span className={styles.trend}>{trendDirection}</span>
          </h3>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {chartData.labels ? (
          <Line data={chartData} options={chartOptions} height={400} />
        ) : (
          <p className={styles.noData}>No data available for chart.</p>
        )}
      </div>
    </div>
  );
}
