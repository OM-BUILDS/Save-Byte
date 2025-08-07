import React, { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+
import styles from "./WastageLineChart.module.css"; // ✅ CSS for styling
import { BASE_API_URL } from "../../api/api";
import { useHttpClient } from "../../hooks/http-hook";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";

export default function WastageLineChart({ hostelId }) {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  // ✅ State for fetched data & chart config
  const [wastageData, setWastageData] = useState({});
  const [chartData, setChartData] = useState({});
  const [selectedOption, setSelectedOption] = useState("wastageByFoodType");
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
      let url = `${BASE_API_URL}/get-wastage-report/`;

      // Add query params if filtered
      if (filtered && startDate && endDate) {
        url += `${startDate}/${endDate}`;
        
      }

      const response = await sendRequest(url, "GET", null, {
        Authorization: "Bearer " + auth.token,
      });

      if (response.success) {
        console.log(("mmmmmmmmmmmmm"));
        console.log(response);
        
        
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

  // 🎨 Dynamic Color Palette for Line Chart
  const dynamicColors = [
    { border: "#42ba96", bg: "rgba(66, 186, 150, 0.2)", point: "#42ba96" }, // Green
    { border: "#ff6384", bg: "rgba(255, 99, 132, 0.2)", point: "#ff6384" }, // Red
    { border: "#36a2eb", bg: "rgba(54, 162, 235, 0.2)", point: "#36a2eb" }, // Blue
    { border: "#ffcd56", bg: "rgba(255, 206, 86, 0.2)", point: "#ffcd56" }, // Yellow
    { border: "#9966ff", bg: "rgba(153, 102, 255, 0.2)", point: "#9966ff" }, // Purple
    { border: "#4bc0c0", bg: "rgba(75, 192, 192, 0.2)", point: "#4bc0c0" }, // Cyan
    { border: "#ff9f40", bg: "rgba(255, 159, 64, 0.2)", point: "#ff9f40" }, // Orange
  ];

  // 🎨 Assign dynamic colors based on selectedOption
  const colorIndex = chartOptions.findIndex(
    (option) => option.value === selectedOption
  );
  const { border, bg, point } =
    dynamicColors[colorIndex % dynamicColors.length];

  setChartData({
    labels,
    datasets: [
      {
        label: "Wastage Quantity (kg)",
        data: values,
        borderColor: border, // 🎨 Line Color
        backgroundColor: bg, // 🎨 Line Fill Color
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: point, // 🎨 Point Color
        tension: 0.4, // Smooth curve effect
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

  // 📊 Chart Options for Better UI
  const chartOptionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#ddd",
        borderWidth: 1,
        titleColor: "#333",
        bodyColor: "#555",
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

      {/* 📊 Line Chart Container */}
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
