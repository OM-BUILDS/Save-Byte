import React, { useState, useEffect, useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+
import styles from "./TrendChart.module.css";
import { BASE_API_URL } from "../../api/api";
import { useHttpClient } from "../../hooks/http-hook";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";

export default function DoughnutChart({ hostelId }) {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

 
  const [chartData, setChartData] = useState({});
  const [mostCommonReason, setMostCommonReason] = useState("");


  useEffect(() => {
    fetchWastageByReasons(); // Initial fetch
  }, []);


  const fetchWastageByReasons = async () => {
    try {
      const url = `${BASE_API_URL}/get-wastage-report`;

      const response = await sendRequest(url, "GET", null, {
        Authorization: "Bearer " + auth.token,
      });

      if (response.success && response.wastageByReasons) {
        updateChartData(response.wastageByReasons);
        findMostCommonReason(response.wastageByReasons);
      }
    } catch (err) {
      showErrorToast("⚠️ Error fetching wastage data by reason.");
    }
  };


  const updateChartData = (data) => {
    if (!data) return;

    const labels = Object.keys(data);
    const values = Object.values(data);

    setChartData({
      labels,
      datasets: [
        {
          label: "Wastage by Reason",
          data: values,
          backgroundColor: [
            "#FF6384", // Red
            "#36A2EB", // Blue
            "#FFCE56", // Yellow
            "#4BC0C0", // Teal
            "#9966FF", // Purple
            "#FF9F40", // Orange
          ],
          hoverOffset: 8,
        },
      ],
    });
  };

 
  const findMostCommonReason = (data) => {
    if (!data) return;

    const entries = Object.entries(data);
    const maxReason = entries.reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    );
    setMostCommonReason(maxReason[0]);
  };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
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
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.headerContainer}>
       
        <div className={styles.trendContainer}>
          <h3>
            Most Common Reason:{" "}
            <span className={styles.trend}>{mostCommonReason || "N/A"}</span>
          </h3>
        </div>
      </div>

    
      <div className={styles.chartWrapper}>
        {chartData.labels ? (
          <Doughnut data={chartData} options={chartOptions} height={400} />
        ) : (
          <p className={styles.noData}>No data available for chart.</p>
        )}
      </div>
    </div>
  );
}
