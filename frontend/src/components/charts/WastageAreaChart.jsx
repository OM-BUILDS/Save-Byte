import React, { useState, useEffect, useContext } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import styles from "./WastageLineChart.module.css"; // ✅ CSS for styling
import { BASE_API_URL } from "../../api/api";
import { useHttpClient } from "../../hooks/http-hook";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";

// ✅ Register Chart.js Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WastageAreaChart({ hostelId }) {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  // ✅ State for fetched data & chart config
  const [wastageData, setWastageData] = useState({});
  const [chartData, setChartData] = useState({});
  const [selectedOption, setSelectedOption] = useState("wastageByDay");
  const [totalWastage, setTotalWastage] = useState(0);

  // 📅 Advanced Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 📝 Dropdown options
  const chartOptions = [
    { value: "wastageByFoodType", label: "Wastage by Food Type" },
    { value: "wastageByVegType", label: "Wastage by Veg/Non-Veg" },
    { value: "wastageByFoodName", label: "Wastage by Food Name" },
    { value: "wastageByReasons", label: "Wastage by Wastage Reason" },
    { value: "wastageByTime", label: "Wastage by Time (Morning, Afternoon, Night)" },
    { value: "wastageByDay", label: "Wastage by Day" },
    { value: "wastageByMonth", label: "Wastage by Month" },
  ];

  // 🎯 Fetch wastage data and generate chart
  useEffect(() => {
    fetchData(); // Initial fetch
  }, []);

  // 📚 Fetch data with optional filters
  const fetchData = async (filtered = false) => {
    try {
      let url = `${BASE_API_URL}/get-wastage-report`;

      // Add query params if filtered
      if (filtered && startDate && endDate) {
        url += `/${startDate}/${endDate}`;
      }

      const response = await sendRequest(url, "GET", null, {
        Authorization: "Bearer " + auth.token,
      });

      if (response.success) {
        setWastageData(response); // ✅ Set wastage data
        updateChartData(response[selectedOption]);
        calculateTotalWastage(response[selectedOption]);
      }
    } catch (err) {
      showErrorToast("⚠️ Error fetching wastage report.");
    }
  };

  // 📊 Update chart when option changes
  const handleOptionChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    updateChartData(wastageData[selectedValue]);
    calculateTotalWastage(wastageData[selectedValue]);
  };

  // 📈 Generate chart data from wastage report
  // 📈 Generate chart data from wastage report
const updateChartData = (data) => {
  if (!data) return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  // 🎨 Dynamic Color Palette for Area Chart
  const dynamicColors = [
    { bg: "rgba(66, 186, 150, 0.2)", border: "#42ba96", point: "#42ba96" }, // Green
    { bg: "rgba(255, 99, 132, 0.2)", border: "#ff6384", point: "#ff6384" }, // Red
    { bg: "rgba(54, 162, 235, 0.2)", border: "#36a2eb", point: "#36a2eb" }, // Blue
    { bg: "rgba(255, 206, 86, 0.2)", border: "#ffcd56", point: "#ffcd56" }, // Yellow
    { bg: "rgba(153, 102, 255, 0.2)", border: "#9966ff", point: "#9966ff" }, // Purple
    { bg: "rgba(75, 192, 192, 0.2)", border: "#4bc0c0", point: "#4bc0c0" }, // Cyan
    { bg: "rgba(255, 159, 64, 0.2)", border: "#ff9f40", point: "#ff9f40" }, // Orange
  ];

  // 🎨 Assign dynamic colors based on selectedOption
  const colorIndex = chartOptions.findIndex(
    (option) => option.value === selectedOption
  );
  const { bg, border, point } =
    dynamicColors[colorIndex % dynamicColors.length];

  setChartData({
    labels,
    datasets: [
      {
        label: "Wastage Quantity (kg)",
        data: values,
        fill: true,
        backgroundColor: bg, // 🎨 Dynamic Fill Color
        borderColor: border, // 🎨 Border Color
        pointBackgroundColor: point, // 🎨 Point Color
        tension: 0.4, // Curved area
      },
    ],
  });
};


  // 📏 Calculate Total Wastage
  const calculateTotalWastage = (data) => {
    if (!data) return;
    const total = Object.values(data).reduce((acc, value) => acc + value, 0);
    setTotalWastage(total);
  };

  // 🎛️ Handle Apply Filter Click
  const applyAdvancedFilter = () => {
    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
      showErrorToast("⚠️ Invalid date range! Please select valid dates.");
      return;
    }
    fetchData(true); // Fetch filtered data
  };

  // 🔄 Handle Reset Filter
  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchData(false); // Fetch original data
  };

  // 🎨 Chart Options
  const chartOptionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.raw} kg`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Category/Time",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Wastage (kg)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.headerContainer}>
        {/* 🔥 Total Wastage Section */}
        <div className={styles.totalWastage}>
          <h3>
            Total Wastage: <span>{totalWastage} kg</span>
          </h3>
        </div>

        {/* 🕰️ Advanced Filter Section */}
        <div className={styles.filterContainer}>
          <label className={styles.label}>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.dateInput}
          />
          <label className={styles.label}>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.dateInput}
          />
          <button onClick={applyAdvancedFilter} className={styles.applyBtn}>
            Apply Filter
          </button>
          <button onClick={resetFilter} className={styles.resetBtn}>
            Reset
          </button>
        </div>
      </div>

      {/* 🔽 Dropdown for selecting wastage type */}
      <div className={styles.dropdownContainer}>
        <label className={styles.label}>Select Wastage Type:</label>
        <select
          value={selectedOption}
          onChange={handleOptionChange}
          className={styles.dropdown}
        >
          {chartOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 📊 Area Chart Container */}
      <div className={styles.chartWrapper}>
        {chartData.labels ? (
          <Line data={chartData} options={chartOptionsConfig} height={400} />
        ) : (
          <p className={styles.noData}>No data available for chart.</p>
        )}
      </div>
    </div>
  );
}
