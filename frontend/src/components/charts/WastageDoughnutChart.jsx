import React, { useState, useEffect, useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+
import styles from "./WastageLineChart.module.css"; // ✅ CSS for styling
import { BASE_API_URL } from "../../api/api";
import { useHttpClient } from "../../hooks/http-hook";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/auth-context";

export default function WastageDoughnutChart({ hostelId }) {
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
  const updateChartData = (data) => {
    if (!data) return;

    const labels = Object.keys(data);
    const values = Object.values(data);

    // 🎨 Dynamic Color Palette for Doughnut Chart
    const dynamicColors = [
      "#42ba96", // Green
      "#ff6384", // Red
      "#36a2eb", // Blue
      "#ffcd56", // Yellow
      "#9966ff", // Purple
      "#4bc0c0", // Cyan
      "#ff9f40", // Orange
    ];

    // 🎨 Assign random colors for each segment
    const backgroundColors = labels.map(
      (_, i) => dynamicColors[i % dynamicColors.length]
    );

    setChartData({
      labels,
      datasets: [
        {
          label: "Wastage Quantity (kg)",
          data: values,
          backgroundColor: backgroundColors, // ✅ Colorful segments
          hoverOffset: 10,
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

  // 🎨 Chart Options for Doughnut Chart
  const chartOptionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const percentage = ((value / totalWastage) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value} kg (${percentage}%)`;
          },
        },
      },
      legend: {
        display: true,
        position: "top",
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

      {/* 🍩 Doughnut Chart Container */}
      <div className={styles.chartWrapper}>
        {chartData.labels ? (
          <Doughnut data={chartData} options={chartOptionsConfig} height={400} />
        ) : (
          <p className={styles.noData}>No data available for chart.</p>
        )}
      </div>
    </div>
  );
}

